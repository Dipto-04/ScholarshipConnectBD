from .models import Notification
from django.core.mail import send_mail
from django.conf import settings
from .fcm_service import send_push_notification

def send_notification(user, title, message, send_email=False, scholarship_id=None):
    """
    Helper function to create a notification for a specific user, 
    send a push notification, and optionally send an email.
    """
    try:
        # 1. Create database notification
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            scholarship_id=scholarship_id
        )
        
        # 2. Send Push Notification via FCM
        try:
            data = {"type": "notification"}
            if scholarship_id:
                data["scholarship_id"] = f"{scholarship_id}"
            
            send_push_notification(user, title, message, data=data)
        except Exception as fcm_err:
            print(f"[NOTIFICATION ERROR] FCM Push failed: {fcm_err}")
        
        # 3. Optionally send Email
        if send_email and user.email:
            try:
                html_content = f"""
                <html>
                    <body style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto;">
                        <h2 style="color: #4CAF50;">{title}</h2>
                        <p style="font-size: 16px; line-height: 1.6;">
                            {message}
                        </p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0 20px 0;" />
                        <p style="font-size: 12px; color: #999;">
                            This is an automated message from <strong>ScholarshipConnect BD</strong>. Please do not reply directly to this email.
                        </p>
                    </body>
                </html>
                """
                send_mail(
                    subject=title,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=html_content,
                    fail_silently=True,
                )
            except Exception as email_err:
                print(f"[NOTIFICATION ERROR] Email failed: {email_err}")
            
        return notification
    except Exception as e:
        print(f"[NOTIFICATION ERROR] Global failure for {user.username}: {e}")
        return None
