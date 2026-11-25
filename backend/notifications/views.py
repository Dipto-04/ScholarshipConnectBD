from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .models import Notification, Broadcast
from .serializers import NotificationSerializer, BroadcastSerializer
from .fcm_service import send_bulk_push_notification

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class NotificationMarkReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Notification.objects.all()

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(is_read=True)

class BroadcastListView(generics.ListCreateAPIView):
    queryset = Broadcast.objects.all().order_by('-created_at')
    serializer_class = BroadcastSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        broadcast = serializer.save(sender=self.request.user)
        
        # When a broadcast is created, send it to all users as a notification
        # Using bulk_create for better performance
        users = User.objects.all()
        notifications = [
            Notification(
                user=user,
                title=f"Broadcast: {broadcast.title}",
                message=broadcast.message
            ) for user in users
        ]
        
        Notification.objects.bulk_create(notifications)

        # Send push notification to all users
        send_bulk_push_notification(
            users,
            title=broadcast.title,
            body=broadcast.message,
            data={"type": "broadcast", "id": f"{broadcast.id}"}
        )
