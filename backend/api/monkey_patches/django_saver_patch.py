# api/monkey_patches/django_saver_patch.py
import json
import sys
import importlib
from typing import Optional, Any, Dict

def apply_patch():
    """
    Main patch function
    """
    return patch_django_saver()

def patch():
    """
    Alternative name
    """
    return patch_django_saver()

def patch_django_saver():
    """
    Patch DjangoSaver at the correct import path
    """
    try:
        print("🔧 Attempting to patch DjangoSaver...")
        print(f"   Target: langgraph.checkpoint.django.saver.DjangoSaver")
        
        # Import the exact module
        target_module = 'langgraph.checkpoint.django.saver'
        
        if target_module in sys.modules:
            module = sys.modules[target_module]
            print(f"   ✓ Module already loaded")
        else:
            module = importlib.import_module(target_module)
            print(f"   ✓ Module imported successfully")
        
        # Store original reference
        if hasattr(module, 'DjangoSaver'):
            original_class = module.DjangoSaver
            module._OriginalDjangoSaver = original_class
            print(f"   ✓ Stored original DjangoSaver class")
        else:
            print(f"   ✗ DjangoSaver not found in module")
            return False
        
        # Import required dependencies
        from django.db import connection
        from packaging import version
        from langgraph.checkpoint.base import (
            BaseCheckpointSaver, 
            Checkpoint, 
            CheckpointMetadata,
            ChannelVersions,
            get_checkpoint_id
        )
        from langgraph.checkpoint.serde.base import SerializerProtocol
        from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer
        from langchain_core.runnables import RunnableConfig
        
        print(f"   ✓ Imported all dependencies")
        
        # Create the patched class
        class PatchedDjangoSaver(original_class):
            """
            Patched DjangoSaver with custom metadata handling
            """
            
            def __init__(
                self,
                *,
                serde: Optional[SerializerProtocol] = None,
            ):
                # Call parent's __init__
                super().__init__(serde=serde)
                print(f"   [DEBUG] PatchedDjangoSaver instance created")
            
            def get_tuple(self, config: RunnableConfig) -> Any:
                """
                Override get_tuple with better metadata handling
                """
                print(f"   [DEBUG] Patched get_tuple called")
                
                try:
                    # Call parent method
                    result = super().get_tuple(config)
                    
                    if result and hasattr(result, 'metadata') and result.metadata:
                        # Clean the metadata
                        result.metadata = self._clean_metadata(result.metadata)
                        print(f"   [DEBUG] Cleaned metadata in get_tuple")
                    
                    return result
                except Exception as e:
                    print(f"   [ERROR] in patched get_tuple: {e}")
                    # Fallback to parent
                    return super().get_tuple(config)
            
            def put(
                self,
                config: RunnableConfig,
                checkpoint: Checkpoint,
                metadata: CheckpointMetadata,
                new_versions: ChannelVersions,
            ) -> RunnableConfig:
                """
                Override put with better metadata handling
                """
                print(f"   [DEBUG] Patched put called")
                
                try:
                    # Clean metadata before passing to parent
                    cleaned_metadata = self._clean_metadata(metadata)
                    print(f"   [DEBUG] Metadata cleaned before put")
                    
                    return super().put(config, checkpoint, cleaned_metadata, new_versions)
                except Exception as e:
                    print(f"   [ERROR] in patched put: {e}")
                    # Fallback with original metadata
                    return super().put(config, checkpoint, metadata, new_versions)
            
            def _clean_metadata(self, metadata: Any) -> Dict:
                """
                Clean metadata to avoid serialization issues
                Returns a clean dictionary
                """
                if metadata is None:
                    return {}
                
                if isinstance(metadata, dict):
                    cleaned = {}
                    for key, value in metadata.items():
                        if value is None:
                            continue
                        
                        # Handle different types
                        if isinstance(value, (bytes, bytearray)):
                            try:
                                cleaned[key] = value.decode('utf-8', errors='ignore')
                            except:
                                cleaned[key] = str(value)
                        
                        elif isinstance(value, (str, int, float, bool)):
                            cleaned[key] = value
                        
                        elif isinstance(value, (list, dict)):
                            # Recursively clean nested structures
                            if isinstance(value, list):
                                cleaned[key] = [
                                    self._clean_metadata(item) if isinstance(item, dict) else item
                                    for item in value
                                ]
                            else:
                                cleaned[key] = self._clean_metadata(value)
                        
                        else:
                            # Convert other types to string
                            cleaned[key] = str(value)
                    
                    return cleaned
                
                elif isinstance(metadata, str):
                    try:
                        parsed = json.loads(metadata)
                        return self._clean_metadata(parsed)
                    except json.JSONDecodeError:
                        return {"raw_text": metadata}
                
                else:
                    return {"value": str(metadata)}
            
            def list(self, *args, **kwargs):
                """
                Override list method to clean metadata in results
                """
                print(f"   [DEBUG] Patched list called")
                
                try:
                    results = super().list(*args, **kwargs)
                    
                    # Process each result if it's a generator
                    def process_results():
                        for result in results:
                            if hasattr(result, 'metadata') and result.metadata:
                                result.metadata = self._clean_metadata(result.metadata)
                            yield result
                    
                    return process_results()
                    
                except Exception as e:
                    print(f"   [ERROR] in patched list: {e}")
                    return super().list(*args, **kwargs)
        
        # Replace the class in the module
        module.DjangoSaver = PatchedDjangoSaver
        print(f"   ✓ Replaced DjangoSaver with PatchedDjangoSaver")
        
        # Update other modules that might have imported DjangoSaver
        patch_count = 0
        for mod_name, mod in list(sys.modules.items()):
            if mod is not None:
                try:
                    if hasattr(mod, 'DjangoSaver') and getattr(mod, 'DjangoSaver', None) is original_class:
                        setattr(mod, 'DjangoSaver', PatchedDjangoSaver)
                        patch_count += 1
                except:
                    pass
        
        if patch_count > 0:
            print(f"   ✓ Updated DjangoSaver in {patch_count} other modules")
        
        print(f"\n✅ SUCCESS: DjangoSaver patched successfully!")
        print(f"   Original class saved as: module._OriginalDjangoSaver")
        print(f"   New class: {PatchedDjangoSaver}")
        
        return True
        
    except ImportError as e:
        print(f"\n❌ IMPORT ERROR: {e}")
        print(f"   Make sure langgraph is installed:")
        print(f"   pip install langgraph-checkpoint-django")
        return False
    
    except Exception as e:
        print(f"\n❌ PATCHING ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


def restore():
    """
    Restore the original DjangoSaver
    """
    try:
        print("🔧 Restoring original DjangoSaver...")
        
        target_module = 'langgraph.checkpoint.django.saver'
        
        if target_module not in sys.modules:
            print(f"   Module not loaded: {target_module}")
            return False
        
        module = sys.modules[target_module]
        
        if hasattr(module, '_OriginalDjangoSaver'):
            module.DjangoSaver = module._OriginalDjangoSaver
            delattr(module, '_OriginalDjangoSaver')
            print(f"   ✓ Restored original DjangoSaver")
            
            # Update other modules
            restore_count = 0
            patched_class = None
            
            # First find what the patched class was
            for mod_name, mod in list(sys.modules.items()):
                if mod is not None and hasattr(mod, 'DjangoSaver'):
                    if not hasattr(mod.DjangoSaver, '_OriginalDjangoSaver'):
                        patched_class = mod.DjangoSaver
                        break
            
            if patched_class:
                for mod_name, mod in list(sys.modules.items()):
                    if mod is not None:
                        try:
                            if hasattr(mod, 'DjangoSaver') and getattr(mod, 'DjangoSaver', None) is patched_class:
                                setattr(mod, 'DjangoSaver', module.DjangoSaver)
                                restore_count += 1
                        except:
                            pass
                
                if restore_count > 0:
                    print(f"   ✓ Restored in {restore_count} other modules")
            
            return True
        else:
            print(f"   No original DjangoSaver found to restore")
            return False
            
    except Exception as e:
        print(f"   ❌ Error restoring: {e}")
        return False