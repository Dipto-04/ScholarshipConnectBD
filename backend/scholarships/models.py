
import os
import time
from django.db import models
from django.contrib.auth.models import User
from core.fields import SafeDecimalField
from core.utils import compress_image

class Scholarship(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=255)
    provider = models.CharField(max_length=255, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='', db_index=True)
    amount = models.CharField(max_length=255, blank=True, default='', help_text="e.g. Full Tuition, $10,000, etc.")
    category = models.CharField(max_length=100, blank=True, default='', db_index=True)
    level = models.CharField(max_length=100, blank=True, default='', db_index=True, help_text="e.g. Bachelors, Masters, PhD")
    field = models.CharField(max_length=100, blank=True, default='', db_index=True, help_text="e.g. Engineering, Arts, etc.")
    min_cgpa = SafeDecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    deadline = models.DateField(db_index=True, null=True, blank=True)
    description = models.TextField(blank=True, default='')
    eligibility = models.TextField(blank=True, default='')
    official_link = models.URLField(blank=True, default='')
    image_url = models.URLField(blank=True, default='')
    image = models.ImageField(upload_to='scholarships/', blank=True, null=True)
    is_featured = models.BooleanField(default=False, db_index=True)

    # Verification System
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    admin_note = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Extremely robust image handling for production storage backends
        if self.image:
            try:
                # Ensure we are at the beginning of the file
                try: self.image.seek(0)
                except: pass
                
                # Standardize filename to something extremely safe
                ext = os.path.splitext(self.image.name)[1].lower()
                if not ext: ext = '.jpg'
                self.image.name = f"scholarship_{int(time.time())}{ext}"
                
                # Try compression which standardizes the file
                new_image = compress_image(self.image)
                if new_image:
                    self.image = new_image
                
                # Final check: ensure pointer is at 0 for storage backend
                try: self.image.seek(0)
                except: pass
            except:
                # If everything fails, just ensure we at least try to seek(0) original
                try: self.image.seek(0)
                except: pass

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
