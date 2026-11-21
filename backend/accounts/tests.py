import datetime
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from .models import EmailOTP


class AccountModelsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='rahim_cse',
            email='rahim@example.com',
            password='securepassword123'
        )
        self.profile = self.user.get_profile()
        self.profile.full_name = 'Rahim Ahmed'
        self.profile.cgpa = Decimal('3.75')
        self.profile.academic_level = 'Bachelors'
        self.profile.university = 'BUET'
        self.profile.save()

    def test_profile_fields_and_defaults(self):
        self.assertEqual(self.profile.full_name, 'Rahim Ahmed')
        self.assertEqual(self.profile.cgpa, Decimal('3.75'))
        self.assertEqual(self.profile.scholar_points, 0)
        self.assertEqual(self.profile.is_pro, False)
        self.assertEqual(self.profile.is_currently_pro, False)

    def test_profile_str_representation(self):
        self.assertEqual(str(self.profile), "rahim_cse's Profile")

    def test_profile_upgrade_to_pro_timed(self):
        self.profile.upgrade_to_pro(days=30)
        self.assertEqual(self.profile.is_pro, True)
        self.assertEqual(self.profile.is_currently_pro, True)

    def test_profile_expired_pro_membership(self):
        self.profile.is_pro = True
        self.profile.pro_expiry = timezone.now() - datetime.timedelta(days=1)
        self.profile.save()
        self.assertEqual(self.profile.is_currently_pro, False)

    def test_email_otp_validity(self):
        otp = EmailOTP.objects.create(email='rahim@example.com', otp='4829')
        self.assertEqual(str(otp), 'rahim@example.com - 4829')
        self.assertEqual(otp.is_valid(), True)

        # Simulate an OTP created 15 minutes ago (past the 10-minute limit)
        otp.created_at = timezone.now() - datetime.timedelta(minutes=15)
        otp.save()
        self.assertEqual(otp.is_valid(), False)
