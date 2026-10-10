"""
MASTER URL CONFIG: Root routing table for the backend.
- Routes to Admin, Accounts, Scholarships, Blog, Applications, and Notifications.
- Connected to: All individual app urls.py.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

from django.views.generic.base import RedirectView
import os

from django.db import connections
from django.db.utils import OperationalError

def home(request):
    return JsonResponse({
        "message": "ScholarshipConnectBD API is running",
        "status": "success",
        "version": "1.0.0"
    })

def health_check(request):
    db_conn = connections['default']
    try:
        db_conn.cursor()
    except OperationalError:
        return JsonResponse({"status": "unhealthy", "database": "disconnected"}, status=503)
    return JsonResponse({"status": "healthy", "database": "connected"})

urlpatterns = [
    path('', home), # Root URL
    path('api/health/', health_check), # Health Check URL
    path('favicon.ico', RedirectView.as_view(url='/static/admin/img/favicon.ico')),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/scholarships/', include('scholarships.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/ai/', include('ai_assistant.urls')),
    path('api/community/', include('community.urls')),
    path('api/payments/', include('payments.urls')),

    # Swagger Documentation URLs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/api/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
