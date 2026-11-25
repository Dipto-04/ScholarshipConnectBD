from django.contrib import admin
from .models import Discussion, DiscussionComment, PollOption, PollVote, Story, StoryReaction, MentorshipSession

@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'is_solved', 'created_at')
    list_filter = ('category', 'is_solved')
    search_fields = ('title', 'content')

@admin.register(DiscussionComment)
class DiscussionCommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'discussion', 'created_at')

@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')

admin.site.register(PollOption)
admin.site.register(PollVote)
admin.site.register(StoryReaction)
admin.site.register(MentorshipSession)
