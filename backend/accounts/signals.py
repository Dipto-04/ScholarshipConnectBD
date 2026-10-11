from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from firebase_admin import auth
from .models import Profile
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def manage_user_profile(sender, instance, created, **kwargs):
    """
    Ensure a Profile exists for every User.
    Using get_or_create to handle both new and existing users safely.
    """
    Profile.objects.get_or_create(user=instance)

@receiver(post_delete, sender=User)
def delete_firebase_user(sender, instance, **kwargs):
    """
    When a User is deleted from Django, also delete them from Firebase.
    The Firebase UID is stored in the Django username field.
    """
    uid = instance.username
    try:
        # Check if the username looks like a Firebase UID (usually ~28 chars)
        # or if we should just try and catch the exception
        auth.delete_user(uid)
        logger.info(f"Successfully deleted Firebase user: {uid} (Email: {instance.email})")
    except auth.UserNotFoundError:
        logger.warning(f"Firebase user {uid} not found. It might have been already deleted.")
    except Exception as e:
        logger.error(f"Error deleting Firebase user {uid}: {e}")
