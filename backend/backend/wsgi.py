"""
WSGI config for backend project.
"""

import os
import sys

# ========== VERCEL PATCH - APPLY IMMEDIATELY ==========
def apply_vercel_patches_immediately():
    """
    Apply patches immediately on module import
    """
    print("🔧 [Vercel-WSGI] Starting immediate patch application...")
    
    # Add paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    # Try to apply patches
    try:
        # Try the unified patch manager first
        from api.monkey_patches.vercel_patch_manager import apply_all_vercel_patches
        
        if apply_all_vercel_patches():
            print("✅ [Vercel-WSGI] Patches applied via manager")
        else:
            # Fallback to direct patches
            print("⚠ [Vercel-WSGI] Manager failed, trying direct patches...")
            
            # Try JsonPlusSerializer fix
            try:
                from api.monkey_patches.jsonplus_fix import fix_jsonplus_serializer
                fix_jsonplus_serializer()
            except:
                pass
            
            # Try DjangoSaver override
            try:
                from api.monkey_patches.django_saver_override import override_django_saver
                override_django_saver()
            except:
                pass
            
            print("✅ [Vercel-WSGI] Direct patches attempted")
            
    except Exception as e:
        print(f"⚠ [Vercel-WSGI] Patch application error: {e}")

# Apply patches RIGHT NOW
apply_vercel_patches_immediately()
# ========== END VERCEL PATCH ==========

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()

# For Vercel
app = application