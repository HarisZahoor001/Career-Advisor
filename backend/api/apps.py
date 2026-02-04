from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """
        This method is called when Django starts.
        Apply monkey patches here.
        """
        # Import here to avoid circular imports
        from django.conf import settings
        
        # Check if monkey patching is enabled
        if not getattr(settings, 'ENABLE_MONKEY_PATCHES', True):
            return
        
        # Apply patches
        try:
            from .monkey_patches import apply_patches
            apply_patches()
            print("✓ Monkey patches applied successfully")
        except Exception as e:
            print(f"✗ Error applying monkey patches: {e}")
            import traceback
            traceback.print_exc()
    
    