from rest_framework import serializers
from .models import Scholarship
from decimal import Decimal
from applications.models import SavedScholarship, ScholarshipApplication

class ScholarshipSerializer(serializers.ModelSerializer):
    is_saved = serializers.SerializerMethodField()
    save_id = serializers.SerializerMethodField()
    is_applied = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()

    class Meta:
        model = Scholarship
        fields = '__all__'
        read_only_fields = ['submitted_by', 'created_at', 'updated_at']

    def validate_min_cgpa(self, value):
        # Handle cases where value might be empty string, None, or zero
        if value is None or value == '':
            return None
        try:
            return Decimal(str(value))
        except (ValueError, TypeError, Decimal.InvalidOperation):
            return None

    def get_is_saved(self, obj):
        saved_dict = self.context.get('saved_dict')
        if saved_dict is not None:
            return obj.id in saved_dict
        
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedScholarship.objects.filter(user=request.user, scholarship=obj).exists()
        return False

    def get_save_id(self, obj):
        saved_dict = self.context.get('saved_dict')
        if saved_dict is not None:
            return saved_dict.get(obj.id)

        request = self.context.get('request')
        if request and request.user.is_authenticated:
            saved = SavedScholarship.objects.filter(user=request.user, scholarship=obj).first()
            return saved.id if saved else None
        return None

    def get_is_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ScholarshipApplication.objects.filter(user=request.user, scholarship=obj).exists()
        return False

    def get_application_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            app = ScholarshipApplication.objects.filter(user=request.user, scholarship=obj).first()
            return app.status if app else None
        return None
