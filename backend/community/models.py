from django.db import models
from django.contrib.auth.models import User
from djongo import models as djongo_models
from core.utils import compress_image

class Discussion(models.Model):
    CATEGORY_CHOICES = [
        ('General', 'General Discussion'),
        ('Open Problems', 'Open Problems'),
        ('Scholarship Help', 'Scholarship Help'),
        ('Scholarships', 'Scholarships'),
        ('SOP/CV', 'SOP/CV Advice'),
        ('Visa Advice', 'Visa Advice'),
        ('Visa', 'Visa Advice'), # Duplicate for frontend compatibility
        ('Success Story', 'Success Story'),
        ('IELTS/GRE', 'IELTS/GRE Preparation'),
        ('Test Prep', 'Test Prep (IELTS/GRE)'),
        ('Life Abroad', 'Life Abroad'),
    ]

    title = models.CharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussions')
    content = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General')
    is_solved = models.BooleanField(default=False)
    points_awarded = models.BooleanField(default=False)
    image = models.ImageField(upload_to='discussion_images/', blank=True, null=True)
    poll_question = models.CharField(max_length=255, blank=True, null=True)
    
    likes = models.ManyToManyField(User, related_name='liked_discussions', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.image:
            new_image = compress_image(self.image)
            if new_image:
                self.image = new_image
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class PollOption(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='poll_options')
    text = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.text} ({self.discussion.title})"

    @property
    def votes_count(self):
        return self.votes.count()

class PollVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='poll_votes')
    option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='votes')

    class Meta:
        unique_together = ('user', 'discussion')

class DiscussionComment(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.discussion.title}"

class Story(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stories')
    media = models.FileField(upload_to='stories/')
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.media:
            new_image = compress_image(self.media)
            if new_image:
                self.media = new_image
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Story by {self.user.username} at {self.created_at}"

class StoryReaction(models.Model):
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('love', 'Love'),
        ('fire', 'Fire'),
        ('clap', 'Clap'),
    ]
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('story', 'user')

class MentorshipSession(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_sessions')
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentee_sessions')
    topic = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Booking fields
    scheduled_date = models.DateField(null=True, blank=True)
    scheduled_time = models.TimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.topic} ({self.mentor.username} & {self.mentee.username})"

class MentorConnection(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_connections')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_connections')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"

class ChatMessage(models.Model):
    _id = djongo_models.ObjectIdField()
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True)
    reaction = models.CharField(max_length=10, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Optional: Link to an application if the chat is about a specific application
    related_application_id = models.IntegerField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.image:
            new_image = compress_image(self.image)
            if new_image:
                self.image = new_image
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.message[:20]}..."

class Report(models.Model):
    REPORT_TYPE = [
        ('Discussion', 'Discussion'),
        ('Comment', 'Comment'),
        ('User', 'User'),
    ]
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_received')
    content_type = models.CharField(max_length=20, choices=REPORT_TYPE)
    content_id = models.IntegerField(null=True, blank=True)
    reason = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='pending') # pending, resolved, dismissed
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report on {self.reported_user.username} by {self.reporter.username}"

class MentorReview(models.Model):
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviewer_reviews')
    rating = models.IntegerField(default=5) # 1-5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('mentor', 'user')

    def __str__(self):
        return f"Review for {self.mentor.username} by {self.user.username} ({self.rating} stars)"
