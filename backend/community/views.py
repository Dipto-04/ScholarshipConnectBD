from rest_framework import generics, permissions, status, response, serializers
from rest_framework.views import APIView
from django.db.models import Q
from .models import Discussion, DiscussionComment, PollOption, PollVote, Story, StoryReaction, MentorshipSession, Report, MentorConnection, ChatMessage, MentorReview
from .serializers import (
    DiscussionSerializer, DiscussionCommentSerializer, 
    StorySerializer, 
    MentorshipSessionSerializer, ReportSerializer,
    MentorConnectionSerializer, ChatMessageSerializer,
    MentorReviewSerializer
)
from django.contrib.auth.models import User
from accounts.models import Profile
from accounts.serializers import ProfileSerializer
from notifications.models import Notification
from notifications.utils import send_notification
from notifications.fcm_service import send_push_notification
from collections import Counter

class DiscussionListCreateView(generics.ListCreateAPIView):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

from rest_framework.exceptions import PermissionDenied
from ai_assistant.services import AIService

class DiscussionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        obj = self.get_object()
        was_solved = obj.is_solved
        
        # Only author or staff can update the discussion
        if obj.author == self.request.user or self.request.user.is_staff:
            instance = serializer.save()
            
            # Smart Point Distribution: If marked as solved, analyze comments
            if instance.is_solved and not was_solved:
                self.distribute_points(instance)
        else:
            raise PermissionDenied("You are not the author of this post.")

    def distribute_points(self, discussion):
        if discussion.points_awarded:
            return
            
        try:
            comments = discussion.comments.all()
            if not comments.exists():
                return

            comment_data = [{'id': c.id, 'user_id': c.user.id, 'text': c.content} for c in comments]
            
            # Call AI to find the best answer
            best_comment_id = AIService.analyze_best_solution(
                discussion.title, 
                discussion.content, 
                comment_data
            )

            if best_comment_id:
                best_comment = discussion.comments.filter(id=best_comment_id).first()
                if best_comment and best_comment.user != discussion.author:
                    profile = best_comment.user.profile
                    profile.scholar_points += 50
                    profile.save()
                    
                    discussion.points_awarded = True
                    discussion.save(update_fields=['points_awarded'])
                    
                    # Notify the solver about their reward
                    send_notification(
                        user=best_comment.user,
                        title="ScholarPoints Awarded! 🌟",
                        message=f"Your answer on '{discussion.title}' was chosen as the best solution. You've earned 50 points!"
                    )

                    print(f"DEBUG: Awarded 50 points to {best_comment.user.username} for solving discussion {discussion.id}")
        except Exception as e:
            print(f"DEBUG: Point distribution failed: {str(e)}")

    def perform_destroy(self, instance):
        # Only author or staff can delete the discussion
        if instance.author == self.request.user or self.request.user.is_staff:
            instance.delete()
        else:
            raise PermissionDenied("You are not the author of this post.")

class DiscussionLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            discussion = Discussion.objects.get(pk=pk)
            if discussion.likes.filter(id=request.user.id).exists():
                discussion.likes.remove(request.user)
                return response.Response({'status': 'unliked'}, status=status.HTTP_200_OK)
            else:
                discussion.likes.add(request.user)
                # Notify author about like (if not own post)
                if discussion.author != request.user:
                    send_notification(
                        user=discussion.author,
                        title="Someone liked your post",
                        message=f"{request.user.username} liked your discussion: '{discussion.title}'"
                    )
                return response.Response({'status': 'liked'}, status=status.HTTP_200_OK)
        except Discussion.DoesNotExist:
            return response.Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

class DiscussionVoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        option_id = request.data.get('option_id')
        try:
            discussion = Discussion.objects.get(pk=pk)
            option = PollOption.objects.get(id=option_id, discussion=discussion)
            
            vote, created = PollVote.objects.get_or_create(
                user=request.user,
                discussion=discussion,
                defaults={'option': option}
            )
            
            if not created:
                vote.option = option
                vote.save()
            
            return response.Response({'status': 'voted'}, status=status.HTTP_200_OK)
        except (Discussion.DoesNotExist, PollOption.DoesNotExist):
            return response.Response({'error': 'Invalid discussion or option'}, status=status.HTTP_400_BAD_REQUEST)

class DiscussionCommentView(generics.CreateAPIView):
    serializer_class = DiscussionCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        discussion_id = self.kwargs.get('pk')
        discussion = Discussion.objects.get(pk=discussion_id)
        instance = serializer.save(user=self.request.user, discussion=discussion)
        
        # Notify post author about new comment (if not own post)
        if discussion.author != self.request.user:
            send_notification(
                user=discussion.author,
                title="New Comment on your post",
                message=f"{self.request.user.username} commented on your post: '{discussion.title}'"
            )

class CommentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DiscussionComment.objects.all()
    serializer_class = DiscussionCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        obj = self.get_object()
        if obj.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You cannot edit this comment.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You cannot delete this comment.")
        instance.delete()

class StoryListCreateView(generics.ListCreateAPIView):
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StoryRetrieveView(generics.RetrieveAPIView):
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class StoryReactionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        reaction_type = request.data.get('reaction_type')
        try:
            story = Story.objects.get(pk=pk)
            reaction, created = StoryReaction.objects.get_or_create(
                story=story,
                user=request.user,
                defaults={'reaction_type': reaction_type}
            )
            if not created:
                if reaction.reaction_type == reaction_type:
                    reaction.delete()
                    return response.Response({'status': 'removed'}, status=status.HTTP_200_OK)
                else:
                    reaction.reaction_type = reaction_type
                    reaction.save()
            return response.Response({'status': 'reacted'}, status=status.HTTP_200_OK)
        except Story.DoesNotExist:
            return response.Response({'error': 'Story not found'}, status=status.HTTP_404_NOT_FOUND)

class MentorshipSessionViewSet(generics.ListCreateAPIView):
    serializer_class = MentorshipSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MentorshipSession.objects.filter(Q(mentor=user) | Q(mentee=user)).order_by('-created_at')

    def perform_create(self, serializer):
        instance = serializer.save(mentee=self.request.user)
        # Notify mentor about new request
        send_notification(
            user=instance.mentor,
            title="New Mentorship Request",
            message=f"Student {self.request.user.username} has requested a session regarding: {instance.topic}."
        )

class MentorshipSessionDetailView(generics.RetrieveUpdateAPIView):
    queryset = MentorshipSession.objects.all()
    serializer_class = MentorshipSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MentorshipSession.objects.filter(Q(mentor=user) | Q(mentee=user))

    def perform_update(self, serializer):
        # Only the mentor can change the status (approved, rejected, completed)
        # The mentee might update details, but let's restrict status to mentor
        instance = self.get_object()
        if 'status' in self.request.data:
            if instance.mentor != self.request.user:
                raise PermissionDenied("Only the mentor can update session status.")
            if instance.status in ['Completed', 'Rejected'] and self.request.data['status'] != instance.status:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Cannot change the status of a completed or rejected session.")
        
        updated_instance = serializer.save()
        
        # Notify mentee about status update
        if 'status' in self.request.data:
            send_notification(
                user=updated_instance.mentee,
                title="Mentorship Status Update",
                message=f"Mentor {self.request.user.username} has {updated_instance.status} your session request on '{updated_instance.topic}'."
            )

class MentorListView(generics.ListAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        # Using __in=[True] to workaround Djongo's boolean filter issue
        queryset = Profile.objects.filter(is_mentor__in=[True]).select_related('user')
        if self.request.user.is_authenticated:
            # Exclude the current user from the list so they don't see themselves as a mentor
            queryset = queryset.exclude(user=self.request.user)
        return queryset

class ReportListView(generics.ListCreateAPIView):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

class ReportActionView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = self.request.data.get('status')
        
        # If admin resolves the report, delete the offending content and notify user
        if new_status == 'resolved':
            try:
                # Send warning notification to the reported user
                Notification.objects.create(
                    user=instance.reported_user,
                    title="Content Removed",
                    message=f"Your {instance.content_type} has been removed by our moderation team due to: {instance.reason}. Please follow our community guidelines."
                )

                if instance.content_type == 'Discussion':
                    Discussion.objects.filter(id=instance.content_id).delete()
                elif instance.content_type == 'Comment':
                    DiscussionComment.objects.filter(id=instance.content_id).delete()
            except Exception as e:
                print(f"Error processing resolution: {e}")
        
        serializer.save()

# --- Connection & Chat Views ---

class MentorConnectionView(generics.ListCreateAPIView):
    serializer_class = MentorConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MentorConnection.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('-created_at')

    def perform_create(self, serializer):
        receiver_id = self.request.data.get('receiver')
        receiver = User.objects.get(id=receiver_id)
        
        # Check if already connected or pending
        if MentorConnection.objects.filter(
            Q(sender=self.request.user, receiver=receiver) | 
            Q(sender=receiver, receiver=self.request.user)
        ).exists():
            raise serializers.ValidationError({"error": "Connection request already exists or you are already connected."})

        instance = serializer.save(sender=self.request.user, receiver=receiver)
        
        send_notification(
            user=receiver,
            title="New Connection Request",
            message=f"{self.request.user.profile.full_name or self.request.user.username} wants to connect with you."
        )

class MentorConnectionActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        action = request.data.get('action') # 'accept' or 'reject'
        try:
            conn = MentorConnection.objects.get(pk=pk, receiver=request.user, status='pending')
            if action == 'accept':
                conn.status = 'accepted'
                conn.save()
                send_notification(
                    user=conn.sender,
                    title="Connection Accepted",
                    message=f"{request.user.profile.full_name or request.user.username} accepted your connection request."
                )
                return response.Response({"status": "accepted"})
            elif action == 'reject':
                conn.status = 'rejected'
                conn.save()
                return response.Response({"status": "rejected"})
        except MentorConnection.DoesNotExist:
            return response.Response({"error": "Request not found"}, status=404)

class ChatMessageView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get all messages where user is either sender or receiver
        # Usually we want to group them by conversation in the frontend
        return ChatMessage.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('created_at')

    def perform_create(self, serializer):
        receiver_id = self.request.data.get('receiver')
        try:
            # Flexible receiver lookup
            receiver = User.objects.filter(id=receiver_id).first()
            if not receiver:
                # Try finding via profile if user ID didn't match
                profile = Profile.objects.filter(id=receiver_id).first()
                if profile:
                    receiver = profile.user
            
            if not receiver:
                # If still not found, check if receiver_id was passed instead of receiver
                receiver_id_alt = self.request.data.get('receiver_id')
                if receiver_id_alt:
                    receiver = User.objects.filter(id=receiver_id_alt).first()

            if not receiver:
                raise serializers.ValidationError({"error": f"Receiver with ID {receiver_id} not found"})
                
            message_text = self.request.data.get('message', '').strip()
            image = self.request.FILES.get('image')
            
            if not message_text and not image:
                raise serializers.ValidationError({"error": "Either message or image is required."})
                
            msg = serializer.save(sender=self.request.user, receiver=receiver)

            # Send push notification to receiver
            sender_name = self.request.user.profile.full_name or self.request.user.username
            notification_body = message_text if message_text else "Sent an image"
            send_push_notification(
                receiver,
                title=f"New message from {sender_name}",
                body=notification_body,
                data={
                    "type": "message",
                    "sender_id": f"{self.request.user.id}",
                    "message_id": f"{msg.pk}"
                }
            )
        except Exception as e:
            # Log the full error to help debug
            print(f"[CHAT ERROR] Failed to create message: {str(e)}")
            raise serializers.ValidationError({"error": str(e)})

class ChatHistoryView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            other_id = self.kwargs.get('other_user_id')
            if not other_id: return ChatMessage.objects.none()
            
            # Resolve the target user
            actual_user = User.objects.filter(id=other_id).first()
            if not actual_user:
                profile = Profile.objects.filter(id=other_id).first()
                if profile: actual_user = profile.user
            
            if not actual_user:
                print(f"[CHAT ERROR] Could not resolve user ID: {other_id}")
                return ChatMessage.objects.none()
            
            # Filter messages where these two users are participants
            return ChatMessage.objects.filter(
                (Q(sender=user) & Q(receiver=actual_user)) |
                (Q(sender=actual_user) & Q(receiver=user))
            ).order_by('created_at')
            
        except Exception as e:
            print(f"ChatHistory Error: {e}")
            return ChatMessage.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Explicitly mark as read using update to avoid Djongo duplicates
        try:
            other_id = self.kwargs.get('other_user_id')
            actual_user = User.objects.filter(id=other_id).first()
            if not actual_user:
                profile = Profile.objects.filter(id=other_id).first()
                if profile: actual_user = profile.user
            
            if actual_user:
                ChatMessage.objects.filter(
                    sender_id=actual_user.id, 
                    receiver_id=request.user.id,
                    is_read=False
                ).update(is_read=True)
        except:
            pass

        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)

class ConversationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        is_support_view = request.query_params.get('type') == 'support'
        
        # Find distinct conversation partners
        sent_to = set(ChatMessage.objects.filter(sender=user).values_list('receiver_id', flat=True).distinct())
        received_from = set(ChatMessage.objects.filter(receiver=user).values_list('sender_id', flat=True).distinct())
        
        other_user_ids = sent_to.union(received_from)
        
        # Optimize unread counts safely (avoids Djongo boolean recursion bug)
        all_received = ChatMessage.objects.filter(receiver=user).only('sender_id', 'is_read')
        unread_counts = Counter(m.sender_id for m in all_received if not m.is_read)
        
        conversations = {}
        # Pre-fetch profiles and staff status
        users_map = {u.id: u for u in User.objects.filter(id__in=other_user_ids).select_related('profile')}
        
        for other_id in other_user_ids:
            other_user = users_map.get(other_id)
            if not other_user: continue

            # If support view is requested by staff, filter out other staff conversations
            # (Show only students/mentors reaching out to support)
            if is_support_view and user.is_staff and other_user.is_staff:
                continue

            # Fetch only the latest message for this conversation
            last_msg = ChatMessage.objects.filter(
                Q(sender_id=user.id, receiver_id=other_id) | 
                Q(sender_id=other_id, receiver_id=user.id)
            ).order_by('-created_at').first()
            
            if not last_msg: continue
            
            unread_count = unread_counts.get(other_id, 0)
            
            full_name = other_user.username
            avatar_url = ""
            try:
                if hasattr(other_user, 'profile'):
                    full_name = other_user.profile.full_name or other_user.username
                    avatar_url = other_user.profile.avatar_url
            except: pass

            conversations[other_id] = {
                'user_id': other_id,
                'username': other_user.username,
                'full_name': full_name,
                'avatar_url': avatar_url,
                'last_message': last_msg.message,
                'last_message_time': last_msg.created_at,
                'is_read': last_msg.is_read if last_msg.sender_id == other_id else True,
                'unread_count': unread_count,
                'is_staff': other_user.is_staff
            }
            
        sorted_conversations = sorted(conversations.values(), key=lambda x: x['last_message_time'], reverse=True)
        return response.Response(sorted_conversations)

class ChatMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk' 

    def get_object(self):
        # Simple and direct lookup using primary key (works for both int and ObjectId)
        pk = self.kwargs.get('id') or self.kwargs.get('pk')
        try:
            return ChatMessage.objects.get(pk=pk)
        except (ChatMessage.DoesNotExist, Exception):
            try:
                from bson import ObjectId
                if len(str(pk)) == 24:
                    return ChatMessage.objects.get(_id=ObjectId(pk))
                return ChatMessage.objects.get(_id=pk)
            except:
                from django.http import Http404
                raise Http404("Message not found")

    def perform_update(self, serializer):
        # Only the sender can edit the message
        instance = self.get_object()
        if instance.sender.id != self.request.user.id:
            raise PermissionDenied("You can only edit your own messages.")
        serializer.save()

    def perform_destroy(self, instance):
        # Sender or Admin can delete
        if instance.sender.id == self.request.user.id or self.request.user.is_staff:
            instance.delete()
        else:
            raise PermissionDenied("You cannot delete this message.")

class ChatMessageReactView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            # 1. Try finding message by PK (Direct string ID for Djongo)
            message = ChatMessage.objects.filter(pk=pk).first()
            
            # 2. If not found and pk looks like a hex string, try _id with ObjectId conversion
            if not message:
                try:
                    from bson import ObjectId
                    if len(str(pk)) == 24:
                        message = ChatMessage.objects.filter(_id=ObjectId(pk)).first()
                    else:
                        message = ChatMessage.objects.filter(_id=pk).first()
                except: pass
            
            if not message:
                return response.Response({'error': 'Message not found'}, status=404)
                
            # Only sender or receiver can react (use IDs for comparison to be safe with Djongo)
            user_id = request.user.id
            if user_id != message.sender.id and user_id != message.receiver.id:
                return response.Response({'error': 'Permission denied'}, status=403)
                
            reaction = request.data.get('reaction')
            if reaction:
                # If same reaction, toggle off
                if message.reaction == reaction:
                    message.reaction = None
                else:
                    message.reaction = reaction
                message.save()
            return response.Response({'status': 'reacted'})
        except Exception as e:
            print(f"[CHAT REACT ERROR] {str(e)}")
            return response.Response({'error': "An error occurred while processing reaction"}, status=400)

class MentorReviewView(generics.ListCreateAPIView):
    serializer_class = MentorReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        mentor_id = self.request.query_params.get('mentor')
        if mentor_id:
            return MentorReview.objects.filter(mentor_id=mentor_id).order_by('-created_at')
        return MentorReview.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        # Use validated_data instead of request.data for the corrected mentor ID
        mentor = serializer.validated_data.get('mentor')
        user = self.request.user

        # Prevent self-review
        if mentor == user:
            raise serializers.ValidationError({"error": "You cannot review yourself."})
        
        # Check if already reviewed
        if MentorReview.objects.filter(mentor=mentor, user=user).exists():
            raise serializers.ValidationError({"error": "You have already reviewed this mentor."})
            
        serializer.save(user=user)
