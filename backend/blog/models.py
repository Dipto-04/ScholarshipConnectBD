from django.db import models
from django.contrib.auth.models import User

class BlogPost(models.Model):
    POST_TYPES = [
        ('blog', 'Success Story'),
    ]
    
    title = models.CharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='blog')
    university = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    tags = models.CharField(max_length=255, blank=True, help_text="Comma separated tags")
    image_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class BlogPostReaction(models.Model):
    REACTION_CHOICES = [
        ('love', 'Love'),
        ('celebrate', 'Celebrate'),
        ('support', 'Support'),
        ('insightful', 'Insightful'),
        ('inspiring', 'Inspiring'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='reactions')
    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES, default='love')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.title}"
