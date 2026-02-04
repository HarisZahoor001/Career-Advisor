# apply_patch.py (place in your backend directory)
#!/usr/bin/env python
"""
One-click patch application for DjangoSaver
"""
import os
import sys

def main():
    print("🚀 DjangoSaver Patch Application")
    print("=" * 60)
    
    # Get current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Current directory: {current_dir}")
    
    # Add to Python path
    sys.path.insert(0, current_dir)
    
    # Setup Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    try:
        import django
        django.setup()
        print("✓ Django setup complete")
    except Exception as e:
        print(f"✗ Django setup failed: {e}")
        return
    
    # Apply patch
    try:
        from api.monkey_patches.django_saver_patch import patch_django_saver
        
        print("\n🔧 Applying patch...")
        success = patch_django_saver()
        
        if success:
            print("\n✅ PATCH SUCCESSFUL!")
            print("-" * 40)
            
            # Show verification
            try:
                import langgraph.checkpoint.django.saver as saver_module
                from langgraph.checkpoint.django.saver import DjangoSaver
                
                print(f"Current DjangoSaver: {DjangoSaver}")
                
                if hasattr(saver_module, '_OriginalDjangoSaver'):
                    print(f"Original stored as: _OriginalDjangoSaver")
                
                # Show methods available
                print(f"\nAvailable methods in patched class:")
                methods = [m for m in dir(DjangoSaver) if not m.startswith('_')]
                for method in sorted(methods)[:10]:  # Show first 10
                    print(f"  • {method}")
                
                print(f"\n💡 Patch includes:")
                print(f"  • Better metadata handling")
                print(f"  • Automatic cleanup of None values")
                print(f"  • Bytes/bytearray conversion")
                print(f"  • Error recovery with fallbacks")
                
            except Exception as e:
                print(f"⚠ Verification note: {e}")
            
        else:
            print("\n❌ PATCH FAILED")
            print("Check the error messages above.")
            
    except ImportError as e:
        print(f"\n❌ IMPORT ERROR: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure you're in the backend directory")
        print("2. Ensure api/monkey_patches/django_saver_patch.py exists")
        print("3. Check if langgraph is installed: pip install langgraph-checkpoint-django")
    
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    main()