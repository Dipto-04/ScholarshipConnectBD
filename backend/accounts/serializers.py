from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Avg
from django.db import DatabaseError
from .models import Profile, AdminActivityLog

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    is_superuser = serializers.BooleanField(source='user.is_superuser', read_only=True)
    is_pro = serializers.BooleanField(source='is_currently_pro', read_only=True)
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    # Use CharField for academic scores to gracefully handle empty strings from frontend
    cgpa = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    ielts_score = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    gre_score = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'user_id', 'username', 'email', 'is_staff', 'is_superuser', 'full_name',
            'phone_number', 'date_of_birth', 'cgpa', 'academic_level', 
            'department', 'university', 'ielts_score', 'gre_score', 'target_countries', 
            'major_course', 'research_interests', 
            'bio', 'linkedin_url', 'github_url', 'facebook_url', 'google_scholar_url',
            'profile_picture', 'profile_picture_url', 'avatar_url', 'updated_at',
            'scholar_points', 'is_pro', 'pro_expiry', 'is_mentor', 'mentorship_bio', 'expertise_areas',
            'skills', 'achievements', 'rating', 'reviews_count'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'avatar_url', 'updated_at', 'scholar_points', 'pro_expiry', 'rating', 'reviews_count']
        extra_kwargs = {
            'date_of_birth': {'allow_null': True, 'required': False},
        }

    def get_rating(self, obj):
        if not obj.is_mentor:
            return 0
        try:
            # We must be careful with Djongo aggregates
            avg_data = obj.user.mentor_reviews.aggregate(Avg('rating'))
            avg = avg_data.get('rating__avg')
            return round(float(avg), 1) if avg else 0
        except:
            return 0

    def get_reviews_count(self, obj):
        if not obj.is_mentor:
            return 0
        try:
            return obj.user.mentor_reviews.count()
        except:
            return 0

    def validate_cgpa(self, value):
        if value is None or value == "":
            return None
        try:
            val = float(value)
            if val < 0 or val > 4.0:
                raise serializers.ValidationError("CGPA must be between 0.0 and 4.0")
            return val
        except (ValueError, TypeError):
            return None

    def validate_ielts_score(self, value):
        if value is None or value == "":
            return None
        try:
            val = float(value)
            if val < 0 or val > 9.0:
                raise serializers.ValidationError("IELTS score must be between 0.0 and 9.0")
            return val
        except (ValueError, TypeError):
            return None

    def validate_gre_score(self, value):
        if value is None or value == "":
            return None
        try:
            return int(value)
        except (ValueError, TypeError):
            raise serializers.ValidationError("GRE score must be a valid integer.")

    def validate_date_of_birth(self, value):
        if value == "" or value is None:
            return None
        return value

    def update(self, instance, validated_data):
        # Handle nested User data (email, username) mapped via source='user.xxx'
        user_data = validated_data.pop('user', {})
        new_email = user_data.get('email')
        new_username = user_data.get('username')

        user_updated = False
        if new_email and instance.user.email != new_email:
            if User.objects.exclude(pk=instance.user.pk).filter(email=new_email).exists():
                raise serializers.ValidationError({"email": "This email is already in use by another account."})
            instance.user.email = new_email
            user_updated = True

        if new_username and instance.user.username != new_username:
            if User.objects.exclude(pk=instance.user.pk).filter(username=new_username).exists():
                raise serializers.ValidationError({"username": "This username is already taken."})
            instance.user.username = new_username
            user_updated = True
        
        if user_updated:
            instance.user.save()

        # Handle profile_picture deletion or update
        if 'profile_picture' in validated_data:
            image_data = validated_data.get('profile_picture')
            if image_data == "" or image_data is None:
                # If explicit empty string or None, delete the file
                if instance.profile_picture:
                    instance.profile_picture.delete(save=False)
                instance.profile_picture = None

        # Update remaining Profile fields
        for attr, value in validated_data.items():
            # SMART UPDATE: Don't overwrite existing data with empty strings or None
            # unless it's a field that is meant to be cleared.
            if value == "" or value is None:
                existing_value = getattr(instance, attr)
                if existing_value: # If there's already data, keep it
                    continue

            setattr(instance, attr, value)
        
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    avatar_url = serializers.CharField(source='profile.avatar_url', read_only=True)
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser', 'full_name', 'avatar_url', 'profile']
        read_only_fields = ['id', 'is_staff', 'is_superuser']

    def get_profile(self, obj):
        profile, _ = Profile.objects.get_or_create(user=obj)
        return ProfileSerializer(profile).data

class AdminActivityLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.username', read_only=True)
    class Meta:
        model = AdminActivityLog
        fields = ['id', 'admin', 'admin_name', 'action', 'target', 'details', 'created_at']

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value
