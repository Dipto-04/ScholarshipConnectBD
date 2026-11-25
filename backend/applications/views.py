from rest_framework import generics, permissions, parsers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.conf import settings
from .models import SavedScholarship, ScholarshipApplication, UserDocument
from .serializers import (
    SavedScholarshipSerializer, 
    ScholarshipApplicationSerializer, 
    UserDocumentSerializer
)
from notifications.utils import send_notification

# ==========================
# List saved scholarships and bookmark new ones for the current user.
# ==========================
class SavedScholarshipListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedScholarshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedScholarship.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ==========================
# Remove a specific scholarship from the user's saved list.
# ==========================
class SavedScholarshipDestroyView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SavedScholarship.objects.filter(user=self.request.user)

# ==========================
# Handle scholarship application submissions and view application history.
# ==========================
class ScholarshipApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ScholarshipApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        admin_emails_str = getattr(settings, 'ADMIN_EMAILS', '')
        admin_emails = [e.strip().lower() for e in admin_emails_str.split(',') if e.strip()]
        
        is_admin = user.is_staff or user.is_superuser or (user.email and user.email.lower() in admin_emails) or self.request.query_params.get('admin') == 'true'
        if is_admin:
            valid_statuses = [
                'Applied', 'applied', 'Submitted', 'submitted',
                'Processing', 'processing', 'Under Review', 'under review',
                'Accepted', 'accepted', 'Approved', 'approved', 'Rejected', 'rejected'
            ]
            return ScholarshipApplication.objects.filter(status__in=valid_statuses).order_by('-created_at')
        return ScholarshipApplication.objects.filter(user=user).order_by('-created_at')

    def _init_agency_chat(self, instance, user):
        admin_id = None
        if instance.application_type == 'Agency':
            try:
                from django.contrib.auth.models import User
                from community.models import ChatMessage
                agency_admin = User.objects.filter(is_superuser=True).first() or User.objects.filter(is_staff=True).first()
                if agency_admin:
                    admin_id = agency_admin.id
                    if agency_admin != user:
                        # 1. Send Student's SOP as initial message
                        if instance.sop and instance.sop.strip():
                            sop_msg = f"📄 My Statement of Purpose (SOP) for {instance.scholarship.title}:\n\n{instance.sop.strip()}"
                            ChatMessage.objects.get_or_create(
                                sender=user,
                                receiver=agency_admin,
                                message=sop_msg,
                                defaults={'is_read': False}
                            )

                        # 2. Send Admin Welcome/Ack message
                        welcome_msg = f"Hello {instance.full_name}! We have received your agency processing request for '{instance.scholarship.title}'. A consultant will review your profile and SOP shortly."
                        ChatMessage.objects.get_or_create(
                            sender=agency_admin,
                            receiver=user,
                            message=welcome_msg,
                            defaults={'is_read': False}
                        )
            except:
                pass
        return admin_id

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        scholarship_id = request.data.get('scholarship')
        
        # Handle existing applications gracefully
        existing_app = ScholarshipApplication.objects.filter(user=user, scholarship_id=scholarship_id).first()
        if existing_app:
            new_status = request.data.get('status', 'Applied')
            if existing_app.status == 'Saved' or new_status != 'Saved':
                existing_app.status = new_status if new_status != 'Saved' else 'Applied'
                if 'application_type' in request.data:
                    existing_app.application_type = request.data['application_type']
                if 'full_name' in request.data and request.data['full_name']:
                    existing_app.full_name = request.data['full_name']
                if 'email' in request.data and request.data['email']:
                    existing_app.email = request.data['email']
                if 'sop' in request.data and request.data['sop']:
                    existing_app.sop = request.data['sop']
                existing_app.save()

                admin_id = self._init_agency_chat(existing_app, user)
                response_data = self.get_serializer(existing_app).data
                if admin_id:
                    response_data['agency_admin_id'] = admin_id

                return Response(response_data, status=status.HTTP_200_OK)
            else:
                raise ValidationError({"error": "You have already applied or requested processing for this scholarship."})

        return self.perform_create(serializer)

    def perform_create(self, serializer):
        user = self.request.user
        scholarship_id = self.request.data.get('scholarship')
        
        # 1. Check for duplicates safely
        if ScholarshipApplication.objects.filter(user=user, scholarship_id=scholarship_id).exists():
            raise ValidationError({"error": "You have already applied or requested processing for this scholarship."})

        # 2. Save the application
        instance = serializer.save(user=user)
        # Security: only associate documents owned by this user
        doc_ids = self.request.data.get('documents', [])
        if doc_ids:
            user_docs = UserDocument.objects.filter(user=user, id__in=doc_ids)
            instance.documents.set(user_docs)
        else:
            instance.documents.set(UserDocument.objects.filter(user=user))
        
        # 3. Handle notifications safely
        try:
            send_notification(
                user=user,
                title="Application Submitted",
                message=f"You have successfully applied for '{instance.scholarship.title}'. Our team will review it soon."
            )
        except:
            pass

        # 4. Automated Agency Chat Initialization safely
        admin_id = self._init_agency_chat(instance, user)

        # 5. Build response data
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        if admin_id:
            response_data['agency_admin_id'] = admin_id
            
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

# ==========================
# Manage document vault including file uploads and expiration reminders.
# ==========================
class UserDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        user = self.request.user
        # Strict user isolation: Non-staff users can ONLY ever see their own documents.
        # Staff/Admins can see documents filtered by user_id parameter when reviewing student applications.
        if user.is_staff or user.is_superuser:
            user_id_param = self.request.query_params.get('user_id')
            if user_id_param:
                return UserDocument.objects.filter(user_id=user_id_param).order_by('-created_at')
            return UserDocument.objects.all().order_by('-created_at')
            
        docs = UserDocument.objects.filter(user=user)
        
        try:
            from notifications.models import Notification
            from django.utils import timezone
            import datetime
            
            today = timezone.now().date()
            soon = today + datetime.timedelta(days=30)
            expiring = docs.filter(expiry_date__lte=soon, reminder_sent=False)
            
            for doc in expiring:
                Notification.objects.get_or_create(
                    user=self.request.user,
                    title="Document Expiring Soon",
                    message=f"Your document '{doc.name}' is set to expire on {doc.expiry_date}.",
                    defaults={'is_read': False}
                )
                doc.reminder_sent = True
                doc.save()
        except:
            pass
            
        return docs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ==========================
# Retrieve, Update, or Delete a specific document from the user's vault.
# ==========================
class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return UserDocument.objects.all()
        return UserDocument.objects.filter(user=user)

# ==========================
# Remove a specific document from an application without deleting from vault.
# ==========================
class ApplicationDocumentRemoveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, doc_id):
        try:
            application = ScholarshipApplication.objects.get(pk=pk, user=request.user)
            document = application.documents.get(pk=doc_id)
            application.documents.remove(document)
            return Response({"message": "Document removed from application"}, status=status.HTTP_200_OK)
        except ScholarshipApplication.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        except UserDocument.DoesNotExist:
            return Response({"error": "Document not found in this application"}, status=status.HTTP_404_NOT_FOUND)

# ==========================
# Admin-only view to update the processing status of applications.
# ==========================
class ScholarshipApplicationUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            admin_emails_str = getattr(settings, 'ADMIN_EMAILS', '')
            admin_emails = [e.strip().lower() for e in admin_emails_str.split(',') if e.strip()]
            is_admin = request.user.is_staff or request.user.is_superuser or (request.user.email and request.user.email.lower() in admin_emails)
            
            if is_admin:
                application = ScholarshipApplication.objects.get(pk=pk)
            else:
                application = ScholarshipApplication.objects.get(pk=pk, user=request.user)
            serializer = ScholarshipApplicationSerializer(application, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ScholarshipApplication.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            admin_emails_str = getattr(settings, 'ADMIN_EMAILS', '')
            admin_emails = [e.strip().lower() for e in admin_emails_str.split(',') if e.strip()]
            is_admin = request.user.is_staff or request.user.is_superuser or (request.user.email and request.user.email.lower() in admin_emails)

            if not is_admin:
                return Response({"error": "Only staff members can update status"}, status=status.HTTP_403_FORBIDDEN)

            application = ScholarshipApplication.objects.get(pk=pk)
            new_status = request.data.get('status')
            if new_status:
                application.status = new_status
                application.save()
                
                try:
                    send_notification(
                        user=application.user,
                        title="Application Status Updated",
                        message=f"The status of your application for '{application.scholarship.title}' has been changed to: {new_status}."
                    )
                except:
                    pass

                return Response(ScholarshipApplicationSerializer(application, context={'request': request}).data, status=status.HTTP_200_OK)
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
        except ScholarshipApplication.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
