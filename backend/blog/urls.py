from django.urls import path
from .views import (
    BlogPostListCreateView, 
    BlogPostRetrieveUpdateDestroyView,
    BlogPostCommentView,
    BlogPostReactionView,
    CommentRetrieveUpdateDestroyView
)

urlpatterns = [
    path('', BlogPostListCreateView.as_view(), name='blog-list-create'),
    path('<int:pk>/', BlogPostRetrieveUpdateDestroyView.as_view(), name='blog-detail'),
    path('<int:pk>/react/', BlogPostReactionView.as_view(), name='blog-react'),
    path('<int:pk>/comment/', BlogPostCommentView.as_view(), name='blog-comment'),
    path('comments/<int:pk>/', CommentRetrieveUpdateDestroyView.as_view(), name='comment-detail'),
]
