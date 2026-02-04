"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import sys
from django.core.asgi import get_asgi_application

def apply_monkey_patches():
    """
    Apply necessary monkey patches before Django starts
    """
    print("🔧 [ASGI] Initializing monkey patches...")
    
    # Add current directory to path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    try:
        # Patch DjangoSaver
        from api.monkey_patches.django_saver_patch import patch_django_saver
        if patch_django_saver():
            print("✅ [ASGI] DjangoSaver patch applied")
            return True
    except ImportError as e:
        print(f"⚠ [ASGI] DjangoSaver patch not available: {e}")
    except Exception as e:
        print(f"⚠ [ASGI] Error applying DjangoSaver patch: {e}")
    
    return False

# Apply patches
apply_monkey_patches()

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_asgi_application()

# For Vercel compatibility
app = application