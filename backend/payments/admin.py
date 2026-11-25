from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'user', 'amount', 'currency', 'payment_method', 'status', 'created_at')
    list_filter = ('status', 'payment_method', 'currency', 'created_at')
    search_fields = ('transaction_id', 'user__username', 'user__email')
    readonly_fields = ('transaction_id', 'created_at', 'updated_at')
    ordering = ('-created_at',)
