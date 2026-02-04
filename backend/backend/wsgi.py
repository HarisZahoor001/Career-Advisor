"""
WSGI config for backend project.
"""

import os
import sys

# ========== VERCEL PATCH ==========
def apply_vercel_patches():
    """
    Apply all necessary patches for Vercel deployment
    """
    print("🚀 [Vercel] Starting patch application...")
    
    # Add current directory to Python path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    # Check if we're on Vercel
    is_vercel = os.environ.get('VERCEL', '0') == '1'
    print(f"[Vercel] Environment: {'Vercel' if is_vercel else 'Local'}")
    
    patches_applied = []
    
    try:
        # Patch 1: DjangoSaver replacement
        print("[Vercel] Applying DjangoSaver replacement...")
        from api.monkey_patches.django_saver_complete_replacement import apply_complete_replacement
        
        if apply_complete_replacement():
            patches_applied.append("DjangoSaver")
            print("✅ [Vercel] DjangoSaver patch applied")
        else:
            print("⚠ [Vercel] DjangoSaver patch failed")
            
    except ImportError as e:
        print(f"⚠ [Vercel] Could not import patch module: {e}")
    except Exception as e:
        print(f"⚠ [Vercel] Error applying patches: {e}")
        import traceback
        traceback.print_exc()
    
    if patches_applied:
        print(f"✅ [Vercel] Applied patches: {', '.join(patches_applied)}")
    else:
        print("⚠ [Vercel] No patches applied")
    
    return len(patches_applied) > 0

# Apply patches IMMEDIATELY on module import
# This happens before Django setup
apply_vercel_patches()
# ========== END VERCEL PATCH ==========

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()

# For Vercel compatibility
app = application