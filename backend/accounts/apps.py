import os
import logging
import json
import firebase_admin
from firebase_admin import credentials
from django.apps import AppConfig

logger = logging.getLogger(__name__)

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # Initialize Firebase Admin SDK
        from django.conf import settings
        firebase_creds_val = settings.FIREBASE_SERVICE_ACCOUNT_KEY
        
        try:
            firebase_admin.get_app()
        except ValueError:
            # App not initialized yet
            initialized = False

            # 1. Try to initialize using JSON string from environment variable
            if firebase_creds_val:
                try:
                    # Check if it's a valid JSON string
                    creds_dict = json.loads(firebase_creds_val)
                    cred = credentials.Certificate(creds_dict)
                    firebase_admin.initialize_app(cred)
                    logger.info("Firebase Admin SDK initialized from JSON environment variable.")
                    initialized = True
                except (json.JSONDecodeError, ValueError, TypeError):
                    # Not a JSON string, move to file path check
                    pass

            # 2. Try to initialize using file path
            if not initialized:
                firebase_creds_path = os.path.join(settings.BASE_DIR, firebase_creds_val) if firebase_creds_val else None
                
                if firebase_creds_path and os.path.exists(firebase_creds_path):
                    try:
                        cred = credentials.Certificate(firebase_creds_path)
                        firebase_admin.initialize_app(cred)
                        logger.info(f"Firebase Admin SDK initialized from file: {firebase_creds_path}")
                        initialized = True
                    except Exception as e:
                        logger.error(f"Error initializing Firebase Admin SDK from file: {e}")
                
            # 3. Final fallback: Attempt default initialization
            if not initialized:
                try:
                    firebase_admin.initialize_app()
                    logger.info("Firebase Admin SDK initialized with default credentials.")
                except Exception as e:
                    logger.warning(f"Firebase Admin SDK could not be initialized: {e}")

        # Import signals to register them
        import accounts.signals
