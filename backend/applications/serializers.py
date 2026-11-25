from rest_framework import serializers
from .models import SavedScholarship, ScholarshipApplication, UserDocument
from scholarships.serializers import ScholarshipSerializer

class SavedScholarshipSerializer(serializers.ModelSerializer):
    scholarship_details = ScholarshipSerializer(source='scholarship', read_only=True)

    class Meta:
        model = SavedScholarship
        fields = ['id', 'user', 'scholarship', 'scholarship_details', 'created_at']
        read_only_fields = ['user']

class ScholarshipApplicationSerializer(serializers.ModelSerializer):
    scholarship_title = serializers.CharField(source='scholarship.title', read_only=True)
    scholarship_country = serializers.CharField(source='scholarship.country', read_only=True)
    scholarship_level = serializers.CharField(source='scholarship.level', read_only=True)
    scholarship_deadline = serializers.DateField(source='scholarship.deadline', read_only=True)
    user_documents = serializers.SerializerMethodField()
    user_full_name = serializers.CharField(source='user.profile.full_name', read_only=True)
    user_avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = ScholarshipApplication
        fields = [
            'id', 'user', 'user_full_name', 'user_avatar_url', 'scholarship', 'scholarship_title', 
            'scholarship_country', 'scholarship_level', 'scholarship_deadline',
            'status', 'application_type', 'full_name', 'email', 'phone', 'university', 
            'cgpa', 'ielts_score', 'academic_level', 'sop', 'user_documents', 'documents',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user']

    def get_user_avatar_url(self, obj):
        try:
            return obj.user.profile.avatar_url
        except:
            return ""

    def get_user_documents(self, obj):
        # Only include documents if request is by staff or the owner
        request = self.context.get('request')
        if request and (request.user.is_staff or request.user == obj.user):
            # If documents are explicitly attached, return those
            if obj.documents.exists():
                docs = obj.documents.all()
            else:
                # Fallback for old applications: return all user documents
                docs = UserDocument.objects.filter(user=obj.user)
            return UserDocumentSerializer(docs, many=True).data
        return []

class UserDocumentSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()

    class Meta:
        model = UserDocument
        fields = ['id', 'user', 'name', 'doc_type', 'file', 'size', 'expiry_date', 'status', 'created_at', 'updated_at']
        read_only_fields = ['user', 'size']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        url = ret.get('file')
        if url and 'res.cloudinary.com' in url and not url.lower().endswith(('.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.webp', '.gif')):
            ret['file'] = f"{url}.pdf"
        return ret
