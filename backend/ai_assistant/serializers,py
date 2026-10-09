from rest_framework import serializers
from .models import AIChatMessage

class AIChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIChatMessage
        fields = ['id', 'message', 'is_user', 'created_at']
