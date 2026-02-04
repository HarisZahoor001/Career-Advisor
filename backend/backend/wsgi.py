"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
import sys
from django.core.wsgi import get_wsgi_application

def apply_monkey_patches():
    """
    Apply necessary monkey patches before Django starts
    """
    print("🔧 Initializing monkey patches...")
    
    # Add current directory to path to ensure imports work
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    patches_applied = []
    
    try:
        # Patch 1: DjangoSaver JsonPlusSerializer fix
        from api.monkey_patches.django_saver_patch import patch_django_saver
        if patch_django_saver():
            patches_applied.append("DjangoSaver")
            print("✅ DjangoSaver patch applied")
    except ImportError as e:
        print(f"⚠ DjangoSaver patch not available: {e}")
    except Exception as e:
        print(f"⚠ Error applying DjangoSaver patch: {e}")
    
    # Add more patches here as needed
    
    if patches_applied:
        print(f"✅ Applied patches: {', '.join(patches_applied)}")
    else:
        print("⚠ No patches were applied")
    
    return len(patches_applied) > 0

# Apply patches BEFORE setting up Django
apply_monkey_patches()

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    application = get_wsgi_application()
    print("✅ WSGI application loaded successfully")
except Exception as e:
    print(f"❌ Failed to load WSGI application: {e}")
    raise

# For Vercel compatibility
app = application