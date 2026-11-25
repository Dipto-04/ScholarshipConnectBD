from django.urls import path
from .views import NotificationListView, NotificationMarkReadView, BroadcastListView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('broadcast/', BroadcastListView.as_view(), name='broadcast-list'),
    path('<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
]
