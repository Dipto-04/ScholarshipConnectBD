from django.contrib import admin
from .models import SavedScholarship, ScholarshipApplication, UserDocument

@admin.register(SavedScholarship)
class SavedScholarshipAdmin(admin.ModelAdmin):
    list_display = ('user', 'scholarship', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'scholarship__title')

@admin.register(ScholarshipApplication)
class ScholarshipApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'scholarship', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'scholarship__title', 'full_name', 'email')
    list_editable = ('status',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'full_name', 'email', 'phone', 'university')
        }),
        ('Application Details', {
            'fields': ('scholarship', 'status', 'sop')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

@admin.register(UserDocument)
class UserDocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'doc_type', 'size', 'created_at')
    list_filter = ('doc_type', 'created_at')
    search_fields = ('name', 'user__username')
    readonly_fields = ('created_at',)
