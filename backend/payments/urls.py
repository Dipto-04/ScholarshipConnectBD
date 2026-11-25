from django.urls import path
from .views import (
    CheckoutView, PaymentSuccessView, PaymentHistoryView, PaymentFailView,
    StripePaymentIntentView, BKashCreatePaymentView, BKashExecutePaymentView
)

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='payment-checkout'),
    path('stripe/create-intent/', StripePaymentIntentView.as_view(), name='stripe-intent'),
    path('bkash/create/', BKashCreatePaymentView.as_view(), name='bkash-create'),
    path('bkash/execute/', BKashExecutePaymentView.as_view(), name='bkash-execute'),
    path('success/', PaymentSuccessView.as_view(), name='payment-success'),
    path('fail/', PaymentFailView.as_view(), name='payment-fail'),
    path('history/', PaymentHistoryView.as_view(), name='payment-history'),
]
