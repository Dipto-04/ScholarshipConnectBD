from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import datetime
from core.fields import SafeDecimalField
from core.utils import compress_image

class Profile(models.Model):
    ACADEMIC_LEVEL_CHOICES = [
        ('HSC', 'Higher Secondary'),
        ('Bachelors', 'Bachelors'),
        ('Masters', 'Masters'),
        ('PhD', 'PhD'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Academic Info
    cgpa = SafeDecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    academic_level = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=100, blank=True)
    university = models.CharField(max_length=255, blank=True)
    ielts_score = SafeDecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    gre_score = models.IntegerField(null=True, blank=True)
    
    # Universal Profile Additions
    skills = models.TextField(blank=True, help_text="List of skills (comma separated)")
    achievements = models.TextField(blank=True, help_text="Academic or professional achievements")
    
    # Preferences
    target_countries = models.CharField(max_length=255, blank=True, help_text="Comma separated countries")
    major_course = models.CharField(max_length=255, blank=True, help_text="e.g. Computer Science")
    research_interests = models.TextField(blank=True, help_text="Comma separated interests (e.g. AI, IoT)")
    bio = models.TextField(max_length=500, blank=True)
    
    # Social Media Links
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    google_scholar_url = models.URLField(blank=True)
    
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    profile_picture_url = models.URLField(blank=True) # Fallback/Alternative
    
    # Gamification & Mentorship
    scholar_points = models.IntegerField(default=0)
    is_pro = models.BooleanField(default=False)
    pro_expiry = models.DateTimeField(null=True, blank=True)
    
    # AI Usage Tracking
    ai_usage_count = models.IntegerField(default=0)
    last_ai_reset = models.DateField(auto_now_add=True)

    is_mentor = models.BooleanField(default=False)
    mentorship_bio = models.TextField(max_length=500, blank=True)
    expertise_areas = models.CharField(max_length=255, blank=True, help_text="e.g. Europe, PhD, STEM")
    
    # Push Notifications
    fcm_token = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.profile_picture:
            new_image = compress_image(self.profile_picture)
            if new_image:
                self.profile_picture = new_image
        super().save(*args, **kwargs)

    @property
    def is_currently_pro(self):
        """
        Check if the user is a Pro member and membership has not expired.
        """
        if not self.is_pro:
            return False
        if self.pro_expiry and self.pro_expiry < timezone.now():
            return False
        return True

    def upgrade_to_pro(self, days=None):
        """
        Upgrade user to Pro or extend membership. If days is None, it's a lifetime upgrade.
        """
        now = timezone.now()
        if days is None:
            self.is_pro = True
            self.pro_expiry = None
        else:
            if self.is_currently_pro and self.pro_expiry:
                self.pro_expiry += datetime.timedelta(days=days)
            else:
                self.is_pro = True
                self.pro_expiry = now + datetime.timedelta(days=days)
        self.save()

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def avatar_url(self):
        """
        Safely returns the profile picture URL.
        Priority: 1. Uploaded File, 2. URL Field, 3. Empty String
        """
        try:
            if self.profile_picture and hasattr(self.profile_picture, 'url'):
                return self.profile_picture.url
        except Exception:
            pass
        return self.profile_picture_url or ""

# Monkey-patch User to have a safe way to access profile
def get_safe_profile(self):
    try:
        return self.profile
    except Exception:
        profile, _ = Profile.objects.get_or_create(user=self)
        return profile

User.add_to_class('get_profile', get_safe_profile)

class EmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=4)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_valid(self):
        # OTP is valid for 10 minutes
        return timezone.now() < self.created_at + datetime.timedelta(minutes=10)

    def __str__(self):
        return f"{self.email} - {self.otp}"

class AdminActivityLog(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    target = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.admin.username} - {self.action} on {self.target}"
