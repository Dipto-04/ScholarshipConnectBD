from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.ProfileView.as_view(), name='user_profile'),
    path('upgrade-pro/', views.UpgradeToProView.as_view(), name='upgrade_pro'),
    path('admin/logs/', views.AdminActivityLogListView.as_view(), name='admin_activity_logs'),
    path('autocomplete/', views.AutocompleteView.as_view(), name='autocomplete'),
    path('analytics/', views.StudentAnalyticsView.as_view(), name='student_analytics'),
    path('activity/', views.UserActivityView.as_view(), name='user_activity'),
    path('admin-login/', views.AdminLoginView.as_view(), name='admin_login'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/delete/', views.UserDeleteView.as_view(), name='user_delete'),
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('update-fcm-token/', views.UpdateFCMTokenView.as_view(), name='update_fcm_token'),
    path('public-profile/<int:pk>/', views.PublicProfileView.as_view(), name='public_profile'),
    path('send-otp/', views.SendOTPView.as_view(), name='send_otp'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify_otp'),
]
