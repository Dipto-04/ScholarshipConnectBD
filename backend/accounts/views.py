from rest_framework import generics, permissions, parsers, exceptions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.contrib.auth.models import User
from django.db import models
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from firebase_admin import auth as firebase_auth
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import datetime
import random
from .models import Profile, AdminActivityLog, EmailOTP
from .serializers import (
    ProfileSerializer, ChangePasswordSerializer, UserSerializer, 
    AdminActivityLogSerializer, ForgotPasswordSerializer
)
from notifications.utils import send_notification
from applications.models import ScholarshipApplication, SavedScholarship, UserDocument

class SensitiveActionThrottle(UserRateThrottle):
    scope = 'sensitive'

class AnonSensitiveActionThrottle(AnonRateThrottle):
    scope = 'sensitive'

class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Allow login using either username or email
        login_id = attrs.get('username')
        password = attrs.get('password')

        if login_id and password:
            user = User.objects.filter(models.Q(username=login_id) | models.Q(email=login_id)).first()
            if user:
                if user.check_password(password):
                    attrs['username'] = user.username 
                else:
                    raise exceptions.AuthenticationFailed("Incorrect password.")
            else:
                raise exceptions.AuthenticationFailed("No account found with this email/username.")
        
        data = super().validate(attrs)
        
        Profile.objects.get_or_create(user=self.user)

        if not self.user.is_staff:
            raise exceptions.PermissionDenied("Only staff members can log in here.")
        return data

class AdminLoginView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer
    throttle_classes = [SensitiveActionThrottle, AnonSensitiveActionThrottle]

@method_decorator(csrf_exempt, name='dispatch')
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.JSONParser, parsers.FormParser)

    def get_object(self):
        if self.request.user.is_authenticated:
            profile, _ = Profile.objects.get_or_create(user=self.request.user)
            return profile
        return None

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', True)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [SensitiveActionThrottle]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """
        Ultra-safe Leaderboard View.
        Designed to handle MongoDB/Djongo limitations by sorting in Python memory.
        """
        try:
            # Fetch all profiles into a list to force DB evaluation safely
            profiles = list(Profile.objects.all())
            
            data = []
            for p in profiles:
                try:
                    # Safely access fields
                    points = p.scholar_points if p.scholar_points else 0
                    
                    if points > 0:
                        user = p.user
                        data.append({
                            "id": p.id,
                            "username": user.username if user else "Unknown",
                            "full_name": p.full_name or (user.username if user else "User"),
                            "scholar_points": points,
                            "avatar_url": p.avatar_url,
                            "is_pro": p.is_pro if p.is_pro else False
                        })
                except:
                    continue
            
            # Sort by points descending in Python memory
            data.sort(key=lambda x: x['scholar_points'], reverse=True)
            
            # Return top 100 results for a better community view
            return Response(data[:100], status=status.HTTP_200_OK)
            
        except:
            # Emergency fallback: ensures Render never returns 500 HTML page
            return Response([], status=status.HTTP_200_OK)
    # Note: Previous generics.ListAPIView was replaced to handle Djongo stability issues.

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        # Allow filtering by staff status
        is_staff_param = self.request.query_params.get('is_staff')
        if is_staff_param:
            is_staff_val = is_staff_param.lower() == 'true'
            # Fallback to manual filtering if Djongo database filter fails
            try:
                # Force evaluation to catch DB errors
                test_query = queryset.filter(is_staff=is_staff_val)
                _ = test_query.exists() 
                queryset = test_query
            except:
                # Manual filter approach for Djongo compatibility
                all_users = User.objects.all()
                user_ids = [u.id for u in all_users if u.is_staff == is_staff_val]
                queryset = User.objects.filter(id__in=user_ids).order_by('-date_joined')
            
        return queryset

class UserDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            if user.is_superuser:
                return Response({"error": "Cannot delete a superuser account."}, status=status.HTTP_403_FORBIDDEN)
            user.delete()
            return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class StudentAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        if today.month == 12:
            end_of_month = today.replace(year=today.year + 1, month=1, day=1) - datetime.timedelta(days=1)
        else:
            end_of_month = today.replace(month=today.month + 1, day=1) - datetime.timedelta(days=1)

        apps = ScholarshipApplication.objects.filter(user=user)
        apps_count = apps.count()
        saved_ids = list(SavedScholarship.objects.filter(user=user).values_list('scholarship_id', flat=True))
        applied_ids = list(apps.values_list('scholarship_id', flat=True))
        relevant_scholarship_ids = list(set(saved_ids + applied_ids))
        
        from scholarships.models import Scholarship
        deadlines_count = Scholarship.objects.filter(
            id__in=relevant_scholarship_ids,
            deadline__range=[today, end_of_month]
        ).count()

        user_docs = UserDocument.objects.filter(user=user).values_list('doc_type', flat=True)
        user_docs_lower = [str(d).lower() for d in user_docs]
        standard_docs = ['SOP', 'CV', 'Passport', 'Transcript']
        missing = [doc for doc in standard_docs if not any(doc.lower() in d for d in user_docs_lower)]

        saved_count = len(saved_ids)
        accepted_count = apps.filter(status='Accepted').count()
        success_rate = (accepted_count / apps_count * 100) if apps_count > 0 else 0

        return Response({
            "applications_submitted": apps_count,
            "deadlines_this_month": deadlines_count,
            "missing_documents": missing,
            "saved_scholarships": saved_count,
            "success_rate": round(success_rate, 1)
        })

class UserActivityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        from community.models import Discussion, DiscussionComment
        liked_discussions = Discussion.objects.filter(likes=user).values('id', 'title', 'created_at')
        comments = DiscussionComment.objects.filter(user=user).select_related('discussion').values(
            'id', 'content', 'created_at', 'discussion__id', 'discussion__title'
        )
        activity = []
        for like in liked_discussions:
            activity.append({"id": like['id'], "type": "like", "title": f"Liked: {like['title']}", "timestamp": like['created_at'], "target_id": like['id']})
        for comment in comments:
            activity.append({"id": comment['id'], "type": "comment", "title": f"Commented on: {comment['discussion__title']}", "subtitle": comment['content'], "timestamp": comment['created_at'], "target_id": comment['discussion__id']})
        activity.sort(key=lambda x: x['timestamp'], reverse=True)
        return Response({"activity": activity, "summary": {"total_likes": len(liked_discussions), "total_comments": len(comments)}})

class UpgradeToProView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        cost = 200
        duration_days = 7
        if profile.scholar_points < cost:
            return Response({"error": "Insufficient points."}, status=status.HTTP_400_BAD_REQUEST)
        profile.upgrade_to_pro(duration_days)
        profile.scholar_points -= cost
        profile.save()
        expiry_str = profile.pro_expiry.strftime('%Y-%m-%d')
        send_notification(user=request.user, title="Pro Membership Activated! 🌟", message=f"Congratulations! You've unlocked 1 week of ScholarConnect Pro using 200 points. Valid until {expiry_str}.", send_email=True)
        return Response({"message": f"Successfully upgraded to Pro until {expiry_str}!", "remaining_points": profile.scholar_points, "expiry": expiry_str})

class AutocompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query_type = request.query_params.get('type')
        search = request.query_params.get('q', '').lower()
        results = []
        if query_type == 'country':
            all_vals = Profile.objects.values_list('target_countries', flat=True)
            flat_list = []
            for item in all_vals:
                if item: flat_list.extend([x.strip() for x in item.split(',')])
            results = list(set(flat_list + ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Japan', 'South Korea', 'Turkey', 'Sweden', 'Norway']))
        elif query_type == 'field':
            all_vals = Profile.objects.values_list('major_course', flat=True)
            results = list(set([x.strip() for x in all_vals if x] + ['Engineering', 'Computer Science', 'Medicine', 'Business', 'Arts', 'Public Health', 'Law', 'Physics', 'Mathematics', 'Data Science', 'Artificial Intelligence', 'Psychology']))
        elif query_type in ['skills', 'interests']:
            field_name = 'skills' if query_type == 'skills' else 'research_interests'
            all_vals = Profile.objects.values_list(field_name, flat=True)
            flat_list = []
            for item in all_vals:
                if item: flat_list.extend([x.strip() for x in item.split(',')])
            defaults = ['Python', 'Java', 'Research'] if query_type == 'skills' else ['AI', 'Machine Learning', 'IoT']
            results = list(set(flat_list + defaults))
        if search:
            results = [r for r in results if search in r.lower()]
        return Response(sorted(results[:10]))

class AdminActivityLogListView(generics.ListAPIView):
    queryset = AdminActivityLog.objects.all().order_by('-created_at')
    serializer_class = AdminActivityLogSerializer
    permission_classes = [permissions.IsAdminUser]

class ForgotPasswordView(APIView):
    """
    Sends a password reset link to the user's email.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = ForgotPasswordSerializer
    throttle_classes = [SensitiveActionThrottle, AnonSensitiveActionThrottle]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Note: In production, this link should point to your frontend's reset page.
            reset_link = f"https://scholarshipconnectbd.vercel.app/reset-password?email={email}"
            
            subject = "Password Reset Request - ScholarshipConnectBD"
            message = (
                f"Hello {user.username},\n\n"
                f"We received a request to reset your password. Please click the link below to set a new password:\n\n"
                f"{reset_link}\n\n"
                f"If you did not request this, please ignore this email.\n\n"
                f"Best regards,\n"
                f"ScholarshipConnectBD Team"
            )
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({
                "message": "Password reset link has been sent to your email."
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateFCMTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        fcm_token = request.data.get('fcm_token')
        if not fcm_token:
            return Response({"error": "FCM token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        profile = request.user.profile
        profile.fcm_token = fcm_token
        profile.save()
        
        return Response({"message": "FCM token updated successfully"}, status=status.HTTP_200_OK)

class PublicProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [SensitiveActionThrottle]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        otp = str(random.randint(1000, 9999))
        EmailOTP.objects.filter(email=email).delete() # Remove old OTPs
        EmailOTP.objects.create(email=email, otp=otp)

        subject = "Your Verification Code - ScholarshipConnectBD"
        message = f"Hello,\n\nYour 4-digit verification code is: {otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nScholarshipConnectBD Team"
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response({"message": "OTP sent successfully to your email."})
        except Exception as e:
            return Response({"error": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        otp_obj = EmailOTP.objects.filter(email=email, otp=otp).last()
        if otp_obj and otp_obj.is_valid():
            otp_obj.is_verified = True
            otp_obj.save()

            # Mark Firebase User as verified
            try:
                user = firebase_auth.get_user_by_email(email)
                firebase_auth.update_user(user.uid, email_verified=True)
            except Exception as e:
                print(f"[OTP] Failed to update Firebase user status: {str(e)}")
                # Even if Firebase update fails, we might still want to proceed if OTP was correct
                # but it's safer to ensure sync.

            return Response({"message": "OTP verified successfully.", "verified": True})
        
        return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
