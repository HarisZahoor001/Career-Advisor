# api/monkey_patches/vercel_patch_manager.py
import os
import sys

def apply_all_vercel_patches():
    """
    Apply all patches needed for Vercel
    """
    print("🚀 [Vercel] Applying all patches...")
    print(f"Python: {sys.version}")
    print(f"Path: {sys.path[:3]}")
    
    # Add current directory to path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(os.path.dirname(current_dir))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    
    patches_applied = []
    
    # Patch 1: Fix JsonPlusSerializer
    try:
        from .jsonplus_fix import fix_jsonplus_serializer
        if fix_jsonplus_serializer():
            patches_applied.append("JsonPlusSerializer")
    except ImportError as e:
        print(f"⚠ [Vercel] JsonPlusSerializer patch not available: {e}")
    except Exception as e:
        print(f"⚠ [Vercel] Error applying JsonPlusSerializer patch: {e}")
    
    # Patch 2: Override DjangoSaver
    try:
        from .django_saver_override import override_django_saver
        if override_django_saver():
            patches_applied.append("DjangoSaver")
    except ImportError as e:
        print(f"⚠ [Vercel] DjangoSaver patch not available: {e}")
    except Exception as e:
        print(f"⚠ [Vercel] Error applying DjangoSaver patch: {e}")
    
    if patches_applied:
        print(f"✅ [Vercel] Applied patches: {', '.join(patches_applied)}")
        return True
    else:
        print("❌ [Vercel] No patches were applied")
        return False