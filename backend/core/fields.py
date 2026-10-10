from django.db import models
from decimal import Decimal
try:
    from bson import Decimal128
except ImportError:
    Decimal128 = None

class SafeDecimalField(models.DecimalField):
    """
    A DecimalField that handles MongoDB's Decimal128 type.
    """
    def to_python(self, value):
        if value is None:
            return None
        
        # Handle MongoDB's Decimal128
        if Decimal128 and isinstance(value, Decimal128):
            return value.to_decimal()
        
        # Handle float and int explicitly to avoid double conversion issues
        if isinstance(value, (float, int)):
            return Decimal(str(value))

        return super().to_python(value)

    def from_db_value(self, value, expression, connection):
        return self.to_python(value)
