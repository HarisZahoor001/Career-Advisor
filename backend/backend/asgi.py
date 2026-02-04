"""
ASGI config for backend project.
"""

import os
import sys

# ========== VERCEL PATCH ==========
def apply_vercel_patches():
    """
    Apply all necessary patches for Vercel deployment
    """
    print("🚀 [Vercel-ASGI] Starting patch application...")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    try:
        # Patch DjangoSaver
        from api.monkey_patches.django_saver_complete_replacement import apply_complete_replacement
        
        if apply_complete_replacement():
            print("✅ [Vercel-ASGI] DjangoSaver patch applied")
        else:
            print("⚠ [Vercel-ASGI] DjangoSaver patch failed")
            
    except ImportError as e:
        print(f"⚠ [Vercel-ASGI] Could not import patch: {e}")
    except Exception as e:
        print(f"⚠ [Vercel-ASGI] Error: {e}")
    
    return True

# Apply patches
apply_vercel_patches()
# ========== END VERCEL PATCH ==========

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_asgi_application()

# For Vercel compatibility
app = application