from rest_framework import serializers
from .models import BlogPost, Comment, BlogPostReaction
from django.contrib.auth.models import User

class BlogPostReactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = BlogPostReaction
        fields = ['id', 'user', 'user_name', 'reaction_type', 'created_at']
        read_only_fields = ['user']

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='user.username', read_only=True)
    author_full_name = serializers.SerializerMethodField()
    author_email = serializers.CharField(source='user.email', read_only=True)
    author_avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'author_name', 'author_full_name', 'author_email', 
            'author_avatar_url', 'content', 'created_at'
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

class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_full_name = serializers.SerializerMethodField()
    author_email = serializers.CharField(source='author.email', read_only=True)
    author_avatar_url = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    reactions = BlogPostReactionSerializer(many=True, read_only=True)
    reactions_count = serializers.IntegerField(source='reactions.count', read_only=True)
    user_reaction = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'author', 'author_name', 'author_full_name', 
            'author_email', 'author_avatar_url', 'author_role', 'post_type',
            'university', 'content', 'tags', 'image_url',
            'reactions', 'reactions_count', 'user_reaction',
            'comments_count', 'comments',
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

    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            reaction = obj.reactions.filter(user=request.user).first()
            return reaction.reaction_type if reaction else None
        return None
