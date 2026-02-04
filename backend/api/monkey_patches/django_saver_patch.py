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
    Patch DjangoSaver to fix JsonPlusSerializer 'dumps' issue
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
            get_checkpoint_id,
            get_checkpoint_metadata
        )
        from langgraph.checkpoint.serde.base import SerializerProtocol
        from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer
        from langchain_core.runnables import RunnableConfig
        
        print(f"   ✓ Imported all dependencies")
        
        # Create the patched class
        class PatchedDjangoSaver(original_class):
            """
            Patched DjangoSaver with FIXED JsonPlusSerializer issue
            """
            
            def __init__(
                self,
                *,
                serde: Optional[SerializerProtocol] = None,
            ):
                # Call parent's __init__
                super().__init__(serde=serde)
                print(f"   [DEBUG] PatchedDjangoSaver instance created")
                
                # Check JsonPlusSerializer methods
                if hasattr(self, 'jsonplus_serde'):
                    serializer = self.jsonplus_serde
                    print(f"   [DEBUG] JsonPlusSerializer methods: {[m for m in dir(serializer) if not m.startswith('_')]}")
            
            def put(
                self,
                config: RunnableConfig,
                checkpoint: Checkpoint,
                metadata: CheckpointMetadata,
                new_versions: ChannelVersions,
            ) -> RunnableConfig:
                """
                FIXED: Override put method to handle JsonPlusSerializer properly
                """
                print(f"   [DEBUG] Patched put called - fixing JsonPlusSerializer issue")
                
                try:
                    # Get configurable parameters
                    configurable = config["configurable"].copy()
                    thread_id = configurable.pop("thread_id")
                    checkpoint_ns = configurable.pop("checkpoint_ns")
                    checkpoint_id = configurable.pop("checkpoint_id", configurable.pop("thread_ts", None))
                    
                    # Serialize checkpoint
                    type_, serialized_checkpoint = self.serde.dumps_typed(checkpoint)
                    
                    # FIX: Handle metadata serialization properly
                    metadata_dict = get_checkpoint_metadata(config, metadata)
                    
                    # Clean metadata first
                    cleaned_metadata = self._clean_metadata(metadata_dict)
                    
                    # Try different serialization methods for JsonPlusSerializer
                    serialized_metadata = {}
                    try:
                        # Check what methods are available
                        serializer = self.jsonplus_serde
                        
                        # Method 1: Try dump() method
                        if hasattr(serializer, 'dump') and callable(serializer.dump):
                            serialized_bytes = serializer.dump(cleaned_metadata)
                        # Method 2: Try dumps() method  
                        elif hasattr(serializer, 'dumps') and callable(serializer.dumps):
                            serialized_bytes = serializer.dumps(cleaned_metadata)
                        # Method 3: Try serialize() method
                        elif hasattr(serializer, 'serialize') and callable(serializer.serialize):
                            serialized_bytes = serializer.serialize(cleaned_metadata)
                        # Method 4: Use json.dumps as fallback
                        else:
                            print(f"   [WARNING] JsonPlusSerializer missing dump/dumps methods, using json.dumps")
                            serialized_bytes = json.dumps(cleaned_metadata, ensure_ascii=False).encode('utf-8')
                        
                        # Convert to string if needed
                        if isinstance(serialized_bytes, bytes):
                            serialized_str = serialized_bytes.decode('utf-8', errors='replace')
                        else:
                            serialized_str = str(serialized_bytes)
                        
                        # Clean null characters
                        serialized_str = serialized_str.replace('\u0000', '')
                        
                        # Parse to dict for JSONField
                        if serialized_str:
                            serialized_metadata = json.loads(serialized_str)
                        else:
                            serialized_metadata = {}
                            
                        print(f"   [DEBUG] Metadata serialized successfully")
                        
                    except Exception as e:
                        print(f"   [WARNING] Failed to serialize metadata with JsonPlusSerializer: {e}")
                        # Fallback to simple dict
                        serialized_metadata = cleaned_metadata
                    
                    # Prepare next config
                    next_config = {
                        "configurable": {
                            "thread_id": thread_id,
                            "checkpoint_ns": checkpoint_ns,
                            "checkpoint_id": checkpoint["id"],
                        }
                    }
                    
                    # Import the model
                    from langgraph.checkpoint.django.checkpoint.models import Checkpoint as CheckpointModel
                    
                    # Create composite ID
                    composite_id = f"{thread_id}-{checkpoint_ns}-{checkpoint['id']}"
                    
                    # Save to database
                    CheckpointModel.objects.update_or_create(
                        composite_id=composite_id,
                        thread_id=thread_id,
                        checkpoint_ns=checkpoint_ns,
                        checkpoint_id=checkpoint["id"],
                        defaults={
                            "parent_checkpoint_id": checkpoint_id,
                            "type": type_,
                            "checkpoint": serialized_checkpoint,
                            "metadata": serialized_metadata,
                        },
                    )
                    
                    print(f"   [DEBUG] Checkpoint saved successfully")
                    return next_config
                    
                except Exception as e:
                    print(f"   [ERROR] in patched put: {e}")
                    # Fallback to original method with cleaned metadata
                    cleaned_metadata = self._clean_metadata(metadata)
                    return super().put(config, checkpoint, cleaned_metadata, new_versions)
            
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
                            # Ensure strings don't have null characters
                            if isinstance(value, str):
                                cleaned[key] = value.replace('\u0000', '')
                            else:
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
                            cleaned[key] = str(value).replace('\u0000', '')
                    
                    return cleaned
                
                elif isinstance(metadata, str):
                    # Clean string
                    cleaned_str = metadata.replace('\u0000', '')
                    try:
                        parsed = json.loads(cleaned_str)
                        return self._clean_metadata(parsed)
                    except json.JSONDecodeError:
                        return {"raw_text": cleaned_str}
                
                else:
                    # Convert to string and clean
                    return {"value": str(metadata).replace('\u0000', '')}
        
        # Replace the class in the module
        module.DjangoSaver = PatchedDjangoSaver
        print(f"   ✓ Replaced DjangoSaver with PatchedDjangoSaver")
        
        # Update other modules
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
        print(f"   Fixes applied:")
        print(f"   1. JsonPlusSerializer 'dumps' method handling")
        print(f"   2. Metadata cleaning with null character removal")
        print(f"   3. Fallback serialization methods")
        
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
            
            # Find the patched class
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