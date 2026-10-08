from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScholarshipViewSet

router = DefaultRouter()
router.register(r'', ScholarshipViewSet, basename='scholarship')

urlpatterns = [
    path('', include(router.urls)),
]
