"""
FIREBASE AUTH: Custom authentication backend for DRF.
- Verifies Firebase ID Tokens from the mobile app.
- Maps Firebase UID to Django User model.
- Automatically creates profiles and handles admin promotion.
- Connected to: accounts.models.Profile, settings.REST_FRAMEWORK.
"""
from firebase_admin import auth
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions
from .models import Profile

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            # Unauthenticated guest request - proceed as Anonymous User silently
            return None

        parts = auth_header.split()
        if not parts or parts[0].lower() != 'bearer':
            print(f"[FIREBASE AUTH] Invalid header format: {parts[0] if parts else 'None'}")
            return None
            
        if len(parts) == 1:
            print("[FIREBASE AUTH] Token missing in Bearer header.")
            return None
        elif len(parts) > 2:
            print("[FIREBASE AUTH] Bearer header has too many parts.")
            return None

        id_token = parts[1]
        
        try:
            # Verify the token with Firebase Admin SDK.
            # This is the real check (signature, expiration, project id).
            decoded_token = auth.verify_id_token(id_token)
            print(f"[FIREBASE AUTH] Token verified for UID: {decoded_token.get('uid')}")
        except Exception as e:
            # If it failed verification, we report it immediately as 401.
            print(f"[FIREBASE AUTH ERROR] Verification failed: {str(e)}")
            
            # Log a snippet of the token for debugging (ONLY FIRST 10 CHARS)
            print(f"[FIREBASE AUTH DEBUG] Token snippet: {id_token[:10]}...")
            
            # More user-friendly messages
            error_str = str(e)
            if "expired" in error_str.lower():
                raise exceptions.AuthenticationFailed("Firebase token has expired.")
            elif "invalid" in error_str.lower():
                raise exceptions.AuthenticationFailed("Invalid Firebase token.")
            else:
                raise exceptions.AuthenticationFailed(f"Firebase authentication failed: {error_str}")

        if not decoded_token:
            return None

        try:
            uid = decoded_token.get('uid')
            email = decoded_token.get('email', '')
            
            # Map Firebase users to Django users by uid (used as username)
            user, created = User.objects.get_or_create(
                username=uid, 
                defaults={'email': email}
            )

            # Promotion to staff if email is in ADMIN_EMAILS
            admin_emails_str = getattr(settings, 'ADMIN_EMAILS', '')
            admin_emails = [e.strip().lower() for e in admin_emails_str.split(',') if e.strip()]
            
            if email and email.lower() in admin_emails:
                if not user.is_staff or not user.is_superuser:
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()
                    print(f"[FIREBASE AUTH] User {email} promoted to staff.")
            
            # Sync email if changed in Firebase
            if not created and email and user.email != email:
                user.email = email
                user.save()
            
            # Ensure Profile exists
            profile, _ = Profile.objects.get_or_create(user=user)
            
            # Initial name sync
            if created or not profile.full_name:
                name = decoded_token.get('name', '')
                if name:
                    profile.full_name = name
                    profile.save()
            
            return (user, None)
        except Exception as e:
            print(f"[FIREBASE AUTH ERROR] Mapping failed: {str(e)}")
            return None

    def authenticate_header(self, request):
        return 'Bearer'
