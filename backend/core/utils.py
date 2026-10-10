from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import UploadedFile, InMemoryUploadedFile
import os
import time

def compress_image(image_field, quality=85, max_size_kb=500):
    """
    Compresses an image to be under max_size_kb (default 500KB).
    Returns an InMemoryUploadedFile if the image was compressed/resized, else None.
    """
    if not image_field:
        return None
        
    # Only compress new uploads, skip existing remote images
    if not isinstance(image_field, UploadedFile):
        return None

    try:
        filename = image_field.name
        extension = os.path.splitext(filename)[1].lower()
        # Only process common image formats
        if extension not in ['.jpg', '.jpeg', '.png', '.webp', '.bmp']:
            return None
    except Exception:
        return None

    max_size = max_size_kb * 1024
    
    try:
        # Reset file pointer before reading
        image_field.seek(0)
        # Open the image using PIL
        img = Image.open(image_field)
    except Exception:
        # Silently fail and return original if PIL cannot process
        return None
    
    # If it's already small enough and is JPEG, we might skip
    try:
        if image_field.size <= max_size and extension in ['.jpg', '.jpeg']:
            return None
    except Exception:
        pass

    # Convert to RGB if necessary (JPEG doesn't support alpha/transparency)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    elif img.mode != "RGB":
        img = img.convert("RGB")
        
    # Initial compression attempt
    tmp_file = BytesIO()
    img.save(tmp_file, format='JPEG', quality=quality, optimize=True)
    
    # Iteratively reduce quality if still over limit
    while tmp_file.tell() > max_size and quality > 15:
        quality -= 5
        tmp_file = BytesIO()
        img.save(tmp_file, format='JPEG', quality=quality, optimize=True)
        
    # If still too big after quality reduction, start resizing
    if tmp_file.tell() > max_size:
        width, height = img.size
        # Don't resize below a reasonable minimum
        while tmp_file.tell() > max_size and width > 400:
            width = int(width * 0.9)
            height = int(height * 0.9)
            img = img.resize((width, height), Image.Resampling.LANCZOS)
            tmp_file = BytesIO()
            img.save(tmp_file, format='JPEG', quality=quality, optimize=True)

    # Prepare a unique filename
    name_without_ext = os.path.splitext(os.path.basename(filename))[0]
    unique_name = f"{name_without_ext}_{int(time.time())}.jpg"
    
    size = tmp_file.tell()
    tmp_file.seek(0)
    
    return InMemoryUploadedFile(
        tmp_file, 
        'ImageField', 
        unique_name,
        'image/jpeg', 
        size, 
        None
    )
