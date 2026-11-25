from django.urls import path
from accounts.views import LeaderboardView
from .views import (
    DiscussionListCreateView, 
    DiscussionRetrieveUpdateDestroyView,
    DiscussionLikeView,
    DiscussionVoteView,
    DiscussionCommentView,
    CommentRetrieveUpdateDestroyView,
    StoryListCreateView,
    StoryRetrieveView,
    StoryReactionView,
    MentorshipSessionViewSet,
    MentorshipSessionDetailView,
    MentorListView,
    ReportListView,
    ReportActionView,
    MentorConnectionView,
    MentorConnectionActionView,
    ChatMessageView,
    ChatHistoryView,
    ChatMessageDetailView,
    ChatMessageReactView,
    ConversationListView,
    MentorReviewView
)

urlpatterns = [
    path('', DiscussionListCreateView.as_view(), name='discussion-list'),
    path('leaderboard/', LeaderboardView.as_view(), name='community-leaderboard'),
    path('reviews/', MentorReviewView.as_view(), name='mentor-review'),
    path('reports/', ReportListView.as_view(), name='report-list'),
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('reports/<int:pk>/', ReportActionView.as_view(), name='report-detail'),
    path('<int:pk>/', DiscussionRetrieveUpdateDestroyView.as_view(), name='discussion-detail'),
    path('<int:pk>/like/', DiscussionLikeView.as_view(), name='discussion-like'),
    path('<int:pk>/vote/', DiscussionVoteView.as_view(), name='discussion-vote'),
    path('<int:pk>/comment/', DiscussionCommentView.as_view(), name='discussion-comment'),
    path('comments/<int:pk>/', CommentRetrieveUpdateDestroyView.as_view(), name='comment-detail'),
    
    # Story endpoints
    path('stories/', StoryListCreateView.as_view(), name='story-list'),
    path('stories/<int:pk>/', StoryRetrieveView.as_view(), name='story-detail'),
    path('stories/<int:pk>/react/', StoryReactionView.as_view(), name='story-react'),

    # Mentorship endpoints
    path('mentors/', MentorListView.as_view(), name='mentor-list'),
    path('mentorships/', MentorshipSessionViewSet.as_view(), name='mentorship-list'),
    path('mentorships/<int:pk>/', MentorshipSessionDetailView.as_view(), name='mentorship-detail'),

    # Connection & Chat endpoints
    path('connections/', MentorConnectionView.as_view(), name='connection-list'),
    path('connections/<int:pk>/action/', MentorConnectionActionView.as_view(), name='connection-action'),
    path('chat/', ChatMessageView.as_view(), name='chat-message-list'),
    path('chat/msg/<str:pk>/', ChatMessageDetailView.as_view(), name='chat-message-detail'),
    path('chat/msg/<str:pk>/react/', ChatMessageReactView.as_view(), name='chat-message-react'),
    path('chat/<int:other_user_id>/', ChatHistoryView.as_view(), name='chat-history'),
]
