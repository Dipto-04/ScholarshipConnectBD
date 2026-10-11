from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'academic_level', 'cgpa', 'university')
    search_fields = ('user__username', 'user__email', 'full_name', 'university', 'phone_number')
    list_filter = ('academic_level', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Account Info', {
            'fields': ('user', 'full_name', 'phone_number', 'date_of_birth', 'profile_picture', 'profile_picture_url')
        }),
        ('Academic Background', {
            'fields': ('academic_level', 'cgpa', 'department', 'university')
        }),
        ('Interests & Bio', {
            'fields': ('target_countries', 'major_course', 'research_interests', 'bio')
        }),
        ('Professional Links', {
            'fields': ('linkedin_url', 'github_url', 'facebook_url', 'google_scholar_url'),
            'classes': ('collapse',),
        }),
        ('System Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
