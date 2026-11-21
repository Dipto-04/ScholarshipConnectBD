from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from .models import Scholarship


class ScholarshipModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='teststudent',
            email='student@example.com',
            password='password123'
        )
        self.scholarship = Scholarship.objects.create(
            title='Fulbright Foreign Student Program',
            provider='US Department of State',
            country='USA',
            amount='Full Tuition',
            category='Merit-Based',
            level='Masters',
            field='Computer Science',
            min_cgpa=Decimal('3.50'),
            submitted_by=self.user
        )

    def test_scholarship_creation_defaults(self):
        self.assertEqual(self.scholarship.title, 'Fulbright Foreign Student Program')
        self.assertEqual(self.scholarship.status, 'pending')
        self.assertEqual(self.scholarship.is_featured, False)

    def test_scholarship_str_representation(self):
        self.assertEqual(str(self.scholarship), 'Fulbright Foreign Student Program')

    def test_scholarship_min_cgpa_and_submitter(self):
        self.assertEqual(self.scholarship.min_cgpa, Decimal('3.50'))
        self.assertEqual(self.scholarship.submitted_by.username, 'teststudent')

    def test_scholarship_status_update(self):
        self.scholarship.status = 'active'
        self.scholarship.is_featured = True
        self.scholarship.save()

        updated = Scholarship.objects.get(id=self.scholarship.id)
        self.assertEqual(updated.status, 'active')
        self.assertEqual(updated.is_featured, True)
