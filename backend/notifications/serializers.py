from rest_framework import serializers
from .models import Notification, Broadcast

class NotificationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']

class BroadcastSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    class Meta:
        model = Broadcast
        fields = ['id', 'sender', 'sender_name', 'title', 'message', 'created_at']
        read_only_fields = ['sender']
