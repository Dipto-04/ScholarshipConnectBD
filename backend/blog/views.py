from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import BlogPost, Comment, BlogPostReaction
from .serializers import BlogPostSerializer, CommentSerializer, BlogPostReactionSerializer

class IsOwnerOrStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Try 'author' then 'user' for ownership check
        owner = getattr(obj, 'author', getattr(obj, 'user', None))
        return owner == request.user or request.user.is_staff

class BlogPostListCreateView(generics.ListCreateAPIView):
    serializer_class = BlogPostSerializer
    
    def get_queryset(self):
        queryset = BlogPost.objects.all().order_by('-created_at')
        post_type = self.request.query_params.get('type')
        if post_type:
            queryset = queryset.filter(post_type=post_type)
        return queryset
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class BlogPostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrStaff]

class BlogPostCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            post = BlogPost.objects.get(pk=pk)
            content = request.data.get('content')
            if not content:
                return Response({"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            Comment.objects.create(user=request.user, post=post, content=content)
            return Response({"message": "Comment added", "comments_count": post.comments.count()})
        except BlogPost.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class CommentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

class BlogPostReactionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            post = BlogPost.objects.get(pk=pk)
            # Default to 'love' if no type provided
            reaction_type = request.data.get('reaction_type', 'love')
            
            reactions = BlogPostReaction.objects.filter(user=request.user, post=post)
            reaction = reactions.first()
            
            if reaction:
                if reaction.reaction_type == reaction_type:
                    reactions.delete()
                    return Response({
                        "message": "Reaction removed", 
                        "reactions_count": post.reactions.count(),
                        "user_reaction": None
                    })
                else:
                    reaction.reaction_type = reaction_type
                    reaction.save()
                    return Response({
                        "message": "Reaction updated", 
                        "reactions_count": post.reactions.count(),
                        "user_reaction": reaction_type
                    })
            else:
                BlogPostReaction.objects.create(user=request.user, post=post, reaction_type=reaction_type)
                return Response({
                    "message": "Reaction added", 
                    "reactions_count": post.reactions.count(),
                    "user_reaction": reaction_type
                })
        except BlogPost.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
