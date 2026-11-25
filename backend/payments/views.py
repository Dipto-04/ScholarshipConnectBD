import uuid
import stripe
import requests
from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.conf import settings
from django.shortcuts import redirect
from .models import Payment
from .serializers import PaymentSerializer
from accounts.models import Profile
from notifications.utils import send_notification

# Configure Stripe
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None) or "sk_test_placeholder"

class StripePaymentIntentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            amount = 50000 # 500.00 BDT in cents (Stripe uses smallest currency unit)
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='bdt',
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            # Create payment record
            Payment.objects.create(
                user=request.user,
                transaction_id=intent['id'],
                amount=500.00,
                status='PENDING',
                payment_method='Stripe'
            )

            return Response({
                'clientSecret': intent['client_secret']
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BKashCreatePaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # bKash Sandbox Mock logic
        # In production, you would call bKash APIs for Token and Payment Create
        transaction_id = f"BK-{str(uuid.uuid4())[:8].upper()}"
        
        Payment.objects.create(
            user=request.user,
            transaction_id=transaction_id,
            amount=500.00,
            status='PENDING',
            payment_method='bKash'
        )

        return Response({
            "status": "success",
            "paymentID": transaction_id,
            "message": "OTP sent to your bKash number (Mock)"
        })

class BKashExecutePaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        payment_id = request.data.get('paymentID')
        otp = request.data.get('otp')
        pin = request.data.get('pin')

        try:
            payment = Payment.objects.get(transaction_id=payment_id)
            payment.status = 'COMPLETED'
            payment.save()

            profile = Profile.objects.get(user=payment.user)
            profile.upgrade_to_pro(None)
            
            send_notification(
                user=payment.user,
                title="bKash Payment Successful! ✅",
                message=f"Your payment of 500 BDT via bKash was successful. Lifetime ScholarConnect Pro access has been added to your account.",
                send_email=True
            )

            return Response({"message": "bKash Payment Successful!"})
        except Payment.DoesNotExist:
            return Response({"error": "Invalid Payment ID"}, status=status.HTTP_404_NOT_FOUND)

# Note: In production, use SSLCommerz Python SDK or their official API
class CheckoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = 500.00 # Price for Pro
        transaction_id = str(uuid.uuid4())[:18]
        
        payment_method = request.data.get('payment_method', 'SSLCommerz')
        
        # Create a payment record
        status_val = 'PENDING'
        if payment_method in ['DirectCard', 'bKash', 'Nagad', 'BanglaQR']:
             status_val = 'COMPLETED'

        payment = Payment.objects.create(
            user=request.user,
            transaction_id=transaction_id,
            amount=amount,
            status=status_val,
            payment_method=payment_method
        )

        if payment_method in ['DirectCard', 'bKash', 'Nagad', 'BanglaQR']:
            profile = Profile.objects.get(user=request.user)
            profile.upgrade_to_pro(None)
            
            send_notification(
                user=request.user,
                title=f"{payment_method} Payment Successful! ✅",
                message=f"Your payment of 500 BDT via {payment_method} was successful. Enjoy Lifetime access to ScholarConnect Pro!",
                send_email=True
            )
            
            return Response({
                "status": "success",
                "transaction_id": transaction_id,
                "message": f"{payment_method} Payment Simulated Successfully"
            }, status=status.HTTP_201_CREATED)

        # SSLCommerz Integration Logic (Simplified for demonstration)
        # In a real scenario, you would call SSLCommerz Init API here
        # settings.SSLCOMMERZ_STORE_ID, settings.SSLCOMMERZ_STORE_PASS
        
        # This URL should be the one provided by SSLCommerz Init API
        gateway_url = f"https://sandbox.sslcommerz.com/gwprocess/v4/api.php?store_id=test_store&tran_id={transaction_id}&total_amount={amount}&currency=BDT&success_url=http://10.0.2.2:8000/api/payments/success/&fail_url=http://10.0.2.2:8000/api/payments/fail/"

        return Response({
            "status": "success",
            "transaction_id": transaction_id,
            "checkout_url": gateway_url 
        }, status=status.HTTP_201_CREATED)

class PaymentSuccessView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # SSLCommerz sends data via POST to this success_url
        transaction_id = request.data.get('tran_id')
        val_id = request.data.get('val_id') # Validation ID from SSLCommerz

        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
            if payment.status != 'COMPLETED':
                # In production: Verify payment with SSLCommerz Validation API using val_id
                payment.status = 'COMPLETED'
                payment.save()
                
                # Upgrade user to Pro
                profile = Profile.objects.get(user=payment.user)
                profile.upgrade_to_pro(None)
                
                send_notification(
                    user=payment.user,
                    title="Payment Successful! 🌟",
                    message=f"Your payment of 500 BDT via SSLCommerz was successful. Your Lifetime Pro membership is now active.",
                    send_email=True
                )
                
                # Redirect to a success page or return response
                return Response({"message": "Payment Successful. You are now a PRO member."}, status=status.HTTP_200_OK)
            return Response({"message": "Already processed"}, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return Response({"error": "Invalid transaction"}, status=status.HTTP_404_NOT_FOUND)

class PaymentFailView(views.APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return Response({"message": "Payment Failed"}, status=status.HTTP_400_BAD_REQUEST)

class PaymentHistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(user=request.user).order_by('-created_at')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
