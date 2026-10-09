from django.db import models
from django.contrib.auth.models import User

class AIRequestLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    request_type = models.CharField(max_length=50) # SOP_WRITE, SOP_REVIEW, CV_REVIEW, ELIGIBILITY, SUPPORT
    prompt = models.TextField()
    response = models.TextField()
    tokens_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.request_type} - {self.created_at}"

class AIChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_chat_messages')
    message = models.TextField()
    is_user = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        role = "User" if self.is_user else "AI"
        return f"{self.user.username} - {role}: {self.message[:20]}..."
