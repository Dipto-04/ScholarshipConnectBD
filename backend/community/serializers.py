import json
from rest_framework import serializers
from .models import Discussion, DiscussionComment, PollOption, PollVote, Story, StoryReaction, MentorshipSession, Report, MentorConnection, ChatMessage, MentorReview
from django.contrib.auth.models import User
from accounts.models import Profile

class MentorReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.profile.full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = MentorReview
        fields = ['id', 'mentor', 'user', 'user_name', 'user_avatar', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

    def get_user_avatar(self, obj):
        try: return obj.user.profile.avatar_url
        except: return ""

    def to_internal_value(self, data):
        # Handle cases where mentor ID might be a Profile ID
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = data.copy() if isinstance(data, dict) else data

        if 'mentor' in data:
            mentor_val = data['mentor']
            try:
                # If it's not a valid User ID, check if it's a Profile ID
                # We check for numeric string or integer
                if str(mentor_val).isdigit():
                    if not User.objects.filter(id=int(mentor_val)).exists():
                        profile = Profile.objects.filter(id=int(mentor_val)).first()
                        if profile:
                            data['mentor'] = profile.user.id
            except (ValueError, TypeError):
                pass
                
        return super().to_internal_value(data)

class PollOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollOption
        fields = ['id', 'text', 'votes_count']

class DiscussionCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='user.username', read_only=True)
    author_full_name = serializers.SerializerMethodField()
    author_email = serializers.CharField(source='user.email', read_only=True)
    author_avatar_url = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = DiscussionComment
        fields = [
            'id', 'user', 'author_name', 'author_full_name', 'author_email', 
            'author_avatar_url', 'content', 'created_at', 'is_author'
        ]
        read_only_fields = ['user']

    def get_is_author(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False

    def get_author_full_name(self, obj):
        try:
            return obj.user.profile.full_name or obj.user.username
        except:
            return obj.user.username

    def get_author_avatar_url(self, obj):
        try:
            return obj.user.profile.avatar_url
        except:
            return ""

class DiscussionSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    title = serializers.CharField(required=False)
    content = serializers.CharField(required=False)
    category = serializers.CharField(required=False, default='General')
    author_full_name = serializers.SerializerMethodField()
    author_email = serializers.CharField(source='author.email', read_only=True)
    author_avatar_url = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    comments = DiscussionCommentSerializer(many=True, read_only=True)
    poll_options = PollOptionSerializer(many=True, read_only=True)
    user_voted_option_id = serializers.SerializerMethodField()

    class Meta:
        model = Discussion
        fields = [
            'id', 'title', 'author', 'author_name', 'author_full_name', 
            'author_email', 'author_avatar_url', 'author_role',
            'content', 'category', 'is_solved', 'image', 'poll_question',
            'poll_options', 'user_voted_option_id',
            'likes_count', 'is_liked', 'comments_count', 'comments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['author']

    def get_author_full_name(self, obj):
        try:
            return obj.author.profile.full_name or obj.author.username
        except:
            return obj.author.username

    def get_author_avatar_url(self, obj):
        try:
            return obj.author.profile.avatar_url
        except:
            return ""

    def get_author_role(self, obj):
        if obj.author.is_staff:
            return "Staff"
        return "Student"

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_user_voted_option_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.poll_votes.filter(user=request.user).first()
            return vote.option.id if vote else None
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        discussion = super().create(validated_data)
        
        if request:
            poll_options_data = request.data.get('poll_options')
            if poll_options_data:
                if isinstance(poll_options_data, str):
                    try:
                        poll_options_data = json.loads(poll_options_data)
                    except Exception:
                        poll_options_data = [opt.strip() for opt in poll_options_data.split(',') if opt.strip()]
                
                if isinstance(poll_options_data, list):
                    for option_text in poll_options_data:
                        if isinstance(option_text, str) and option_text.strip():
                            PollOption.objects.create(discussion=discussion, text=option_text.strip())
        return discussion

    def update(self, instance, validated_data):
        request = self.context.get('request')
        discussion = super().update(instance, validated_data)
        
        if request:
            poll_options_data = request.data.get('poll_options')
            if poll_options_data is not None:
                if isinstance(poll_options_data, str):
                    try:
                        poll_options_data = json.loads(poll_options_data)
                    except Exception:
                        poll_options_data = [opt.strip() for opt in poll_options_data.split(',') if opt.strip()]
                
                if isinstance(poll_options_data, list) and len(poll_options_data) > 0:
                    discussion.poll_options.all().delete()
                    for option_text in poll_options_data:
                        if isinstance(option_text, str) and option_text.strip():
                            PollOption.objects.create(discussion=discussion, text=option_text.strip())
        return discussion

class StoryReactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = StoryReaction
        fields = ['id', 'user', 'user_name', 'reaction_type', 'created_at']
        read_only_fields = ['user']

class StorySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='user.username', read_only=True)
    author_full_name = serializers.SerializerMethodField()
    author_avatar_url = serializers.SerializerMethodField()
    reactions = StoryReactionSerializer(many=True, read_only=True)
    reactions_count = serializers.IntegerField(source='reactions.count', read_only=True)
    user_reaction = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            'id', 'user', 'author_name', 'author_full_name', 'author_avatar_url',
            'media', 'caption', 'reactions', 'reactions_count', 'user_reaction',
            'created_at'
        ]
        read_only_fields = ['user']

    def get_author_full_name(self, obj):
        try:
            return obj.user.profile.full_name or obj.user.username
        except:
            return obj.user.username

    def get_author_avatar_url(self, obj):
        try:
            return obj.user.profile.avatar_url
        except:
            return ""

    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            reaction = obj.reactions.filter(user=request.user).first()
            return reaction.reaction_type if reaction else None
        return None

class MentorshipSessionSerializer(serializers.ModelSerializer):
    mentor_name = serializers.CharField(source='mentor.profile.full_name', read_only=True)
    mentee_name = serializers.CharField(source='mentee.profile.full_name', read_only=True)
    status = serializers.CharField(read_only=True)
    mentee = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = MentorshipSession
        fields = [
            'id', 'mentor', 'mentee', 'topic', 'message', 'status', 
            'scheduled_date', 'scheduled_time', 'created_at',
            'mentor_name', 'mentee_name'
        ]
        read_only_fields = ['id', 'mentee', 'status', 'created_at']

    def to_internal_value(self, data):
        # Create a mutable copy of data if it's a QueryDict
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = data.copy() if isinstance(data, dict) else data

        if 'mentor' in data:
            mentor_val = data['mentor']
            try:
                # 1. Try to see if it's already a valid User ID
                if not User.objects.filter(id=mentor_val).exists():
                    # 2. If not, check if it's a Profile ID
                    profile = Profile.objects.filter(id=mentor_val).first()
                    if profile:
                        # 3. Swap it with the correct User ID
                        data['mentor'] = profile.user.id
            except (ValueError, TypeError):
                pass
                
        return super().to_internal_value(data)

class MentorConnectionSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.profile.full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.profile.full_name', read_only=True)
    sender_avatar = serializers.SerializerMethodField()
    receiver_avatar = serializers.SerializerMethodField()

    class Meta:
        model = MentorConnection
        fields = ['id', 'sender', 'receiver', 'status', 'sender_name', 'receiver_name', 'sender_avatar', 'receiver_avatar', 'created_at']
        read_only_fields = ['sender', 'status', 'created_at']

    def get_sender_avatar(self, obj):
        try: return obj.sender.profile.avatar_url
        except: return ""

    def get_receiver_avatar(self, obj):
        try: return obj.receiver.profile.avatar_url
        except: return ""

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.profile.full_name', read_only=True)
    sender_is_mentor = serializers.BooleanField(source='sender.profile.is_mentor', read_only=True)
    sender_is_staff = serializers.BooleanField(source='sender.is_staff', read_only=True)
    receiver_name = serializers.CharField(source='receiver.profile.full_name', read_only=True)
    is_me = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField() # Explicitly handle MongoDB _id

    class Meta:
        model = ChatMessage
        fields = [
            'id', 'sender', 'receiver', 'message', 'image', 'reaction',
            'is_read', 'created_at', 'sender_name', 'sender_is_mentor', 'sender_is_staff', 
            'receiver_name', 'is_me', 'related_application_id'
        ]
        read_only_fields = ['id', 'sender', 'receiver', 'is_read', 'created_at']

    def get_id(self, obj):
        # Access MongoDB's internal ID safely
        if hasattr(obj, '_id') and obj._id:
            return str(obj._id)
        if obj.pk:
            return str(obj.pk)
        return None

    def get_is_me(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender == request.user
        return False

class ReportSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    reporter_name = serializers.CharField(source='reporter.username', read_only=True)
    reported_user_name = serializers.CharField(source='reported_user.username', read_only=True)
    reported_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=True)
    
    class Meta:
        model = Report
        fields = ['id', 'reporter', 'reporter_name', 'reported_user', 'reported_user_name', 'content_type', 'content_id', 'reason', 'description', 'status', 'created_at']
        read_only_fields = ['reporter', 'status']
