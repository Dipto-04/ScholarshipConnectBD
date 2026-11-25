from django.db import models
from django.contrib.auth.models import User
from scholarships.models import Scholarship
from core.utils import compress_image
from core.fields import SafeDecimalField
from cloudinary_storage.storage import RawMediaCloudinaryStorage

class SavedScholarship(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_scholarships')
    scholarship = models.ForeignKey(Scholarship, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'scholarship')
        ordering = ['-created_at']

class ScholarshipApplication(models.Model):
    STATUS_CHOICES = [
        ('Saved', 'Saved'),
        ('Applied', 'Applied'),
        ('Processing', 'Processing'), # New status for Agency
        ('Under Review', 'Under Review'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    APPLICATION_TYPES = [
        ('Self', 'Self Application'),
        ('Agency', 'Agency Processing'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    scholarship = models.ForeignKey(Scholarship, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    application_type = models.CharField(max_length=10, choices=APPLICATION_TYPES, default='Self')
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    university = models.CharField(max_length=255, blank=True)
    cgpa = SafeDecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    ielts_score = SafeDecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    academic_level = models.CharField(max_length=50, blank=True)
    sop = models.TextField(verbose_name="Statement of Purpose")
    
    # Selected documents for this specific application
    documents = models.ManyToManyField('UserDocument', related_name='applications', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'scholarship')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.scholarship.title}"

def user_document_upload_path(instance, filename):
    user_id = instance.user_id if instance and instance.user_id else 'guest'
    return f'documents/user_{user_id}/{filename}'

class UserDocument(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=100)
    file = models.FileField(upload_to=user_document_upload_path, storage=RawMediaCloudinaryStorage())
    size = models.CharField(max_length=50, blank=True)
    
    # ENHANCED FEATURES: Expiry Tracking
    expiry_date = models.DateField(null=True, blank=True)
    reminder_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.file:
            new_image = compress_image(self.file)
            if new_image:
                self.file = new_image
        super().save(*args, **kwargs)
        if self.file:
            try:
                print(f"[DOCUMENT UPLOAD] Document saved for {self.user.username}: {self.file.url}")
            except Exception:
                pass

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    @property
    def status(self):
        from django.utils import timezone
        if not self.expiry_date:
            return 'Permanent'
        
        today = timezone.now().date()
        if self.expiry_date < today:
            return 'Expired'
        
        diff = (self.expiry_date - today).days
        if diff <= 30:
            return 'Expiring Soon'
        
        return 'Valid'
