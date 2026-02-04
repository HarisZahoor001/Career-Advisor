# your_app/monkey_patches/__init__.py
"""
Monkey patches manager for the application
"""

import importlib
import sys
from django.conf import settings

# List of all available patches
PATCHES = [
    'api.monkey_patches.django_saver_patch',
    # Add more patch modules here
]

class PatchManager:
    """Manages application of monkey patches"""
    
    _applied_patches = {}
    
    @classmethod
    def apply_all(cls, force=False):
        """Apply all registered patches"""
        if not getattr(settings, 'ENABLE_MONKEY_PATCHES', True):
            print("Monkey patches are disabled in settings")
            return
        
        for patch_module in PATCHES:
            cls.apply(patch_module, force)
    
    @classmethod
    def apply(cls, patch_module, force=False):
        """Apply a specific patch"""
        if patch_module in cls._applied_patches and not force:
            return
        
        try:
            module = importlib.import_module(patch_module)
            if hasattr(module, 'apply_patch'):
                # Some patches might use apply_patch instead
                result = module.apply_patch()
            else:
                # Look for patch function
                patch_func = None
                for attr_name in ['patch', 'apply', 'patch_all']:
                    if hasattr(module, attr_name):
                        patch_func = getattr(module, attr_name)
                        break
                
                if patch_func and callable(patch_func):
                    result = patch_func()
                else:
                    result = False
                    print(f"✗ No patch function found in {patch_module}")
            
            if result:
                cls._applied_patches[patch_module] = True
                print(f"✓ Applied patch: {patch_module}")
            else:
                print(f"✗ Failed to apply patch: {patch_module}")
                
        except ImportError as e:
            print(f"✗ Could not import patch module {patch_module}: {e}")
        except Exception as e:
            print(f"✗ Error applying patch {patch_module}: {e}")
            import traceback
            traceback.print_exc()
    
    @classmethod
    def restore_all(cls):
        """Restore all applied patches"""
        for patch_module in cls._applied_patches.keys():
            cls.restore(patch_module)
    
    @classmethod
    def restore(cls, patch_module):
        """Restore a specific patch"""
        try:
            module = importlib.import_module(patch_module)
            if hasattr(module, 'restore_patch'):
                module.restore_patch()
            elif hasattr(module, 'restore'):
                module.restore()
            
            if patch_module in cls._applied_patches:
                del cls._applied_patches[patch_module]
            print(f"✓ Restored patch: {patch_module}")
            
        except Exception as e:
            print(f"✗ Error restoring patch {patch_module}: {e}")
    
    @classmethod
    def list_applied(cls):
        """List all applied patches"""
        return list(cls._applied_patches.keys())


# Convenience functions
def apply_patches():
    """Apply all patches - call this from your app"""
    PatchManager.apply_all()

def restore_patches():
    """Restore all patches"""
    PatchManager.restore_all()