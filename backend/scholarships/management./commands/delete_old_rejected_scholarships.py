from django.core.management.base import BaseCommand
from django.utils import timezone
from scholarships.models import Scholarship
from datetime import timedelta

class Command(BaseCommand):
    help = 'Deletes rejected scholarships older than 30 days'

    def handle(self, *args, **options):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Find rejected scholarships updated more than 30 days ago
        old_rejected = Scholarship.objects.filter(
            status='rejected',
            updated_at__lte=thirty_days_ago
        )
        
        count = old_rejected.count()
        if count > 0:
            old_rejected.delete()
            self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} rejected scholarships older than 30 days.'))
        else:
            self.stdout.write(self.style.SUCCESS('No old rejected scholarships to delete.'))
