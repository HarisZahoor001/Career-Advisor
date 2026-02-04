"""
WSGI config for backend project.
"""

import os
import sys

# ========== VERCEL EMERGENCY PATCH ==========
def apply_vercel_emergency_fixes():
    """
    Apply emergency fixes for Vercel
    """
    print("🚨 [Vercel] Applying emergency fixes...")
    
    # Add paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    patches_applied = []
    
    # Try emergency patch first (most likely to work)
    try:
        from api.monkey_patches.emergency_patch import apply_emergency_patch
        if apply_emergency_patch():
            patches_applied.append("EmergencyPatch")
    except Exception as e:
        print(f"⚠ [Vercel] Emergency patch failed: {e}")
    
    # Try simple DjangoSaver
    if not patches_applied:
        try:
            from api.monkey_patches.simple_django_saver import create_simple_django_saver
            if create_simple_django_saver():
                patches_applied.append("SimpleDjangoSaver")
        except Exception as e:
            print(f"⚠ [Vercel] Simple saver failed: {e}")
    
    # Try serializer fix
    try:
        from api.monkey_patches.complete_serializer_fix import apply_complete_serializer_fix
        if apply_complete_serializer_fix():
            patches_applied.append("SerializerFix")
    except Exception as e:
        print(f"⚠ [Vercel] Serializer fix failed: {e}")
    
    if patches_applied:
        print(f"✅ [Vercel] Applied: {', '.join(patches_applied)}")
        return True
    else:
        print("❌ [Vercel] No patches applied")
        return False

# Apply fixes IMMEDIATELY
apply_vercel_emergency_fixes()
# ========== END VERCEL PATCH ==========

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()

# For Vercel
app = application