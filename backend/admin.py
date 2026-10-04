from django.contrib import admin
from .models import Scholarship

@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'country', 'level', 'deadline', 'status', 'is_featured', 'is_active')
    search_fields = ('title', 'provider', 'country', 'category')
    list_filter = ('status', 'is_featured', 'country', 'category', 'deadline', 'level')
    list_editable = ('status', 'is_featured', 'deadline')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'provider', 'country', 'category', 'image_url')
        }),
        ('Details', {
            'fields': ('level', 'field', 'amount', 'min_cgpa', 'deadline', 'description', 'eligibility', 'official_link')
        }),
        ('Verification & Status', {
            'fields': ('status', 'submitted_by', 'is_featured')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def is_active(self, obj):
        from django.utils import timezone
        return obj.deadline >= timezone.now().date()
    is_active.boolean = True
    is_active.short_description = 'Active?'
