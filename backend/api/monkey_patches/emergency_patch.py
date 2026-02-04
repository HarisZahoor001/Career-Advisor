# api/monkey_patches/emergency_patch.py
import os
import sys
import json

def apply_emergency_patch():
    """
    Emergency patch that directly monkey patches the problematic methods
    """
    print("🚨 [Vercel] Applying emergency patch...")
    
    try:
        # Import DjangoSaver
        from langgraph.checkpoint.django.saver import DjangoSaver
        
        # Store original methods
        original_put = DjangoSaver.put
        original_get_tuple = DjangoSaver.get_tuple
        
        # Patch put method
        def emergency_put(self, config, checkpoint, metadata, new_versions):
            try:
                print("[EmergencyPatch.put] Attempting save...")
                
                # Import inside function to avoid circular imports
                from langgraph.checkpoint.base import get_checkpoint_metadata
                from langgraph.checkpoint.django.checkpoint.models import Checkpoint as CheckpointModel
                
                # Extract config
                thread_id = config["configurable"]["thread_id"]
                checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
                checkpoint_id = config["configurable"].get("checkpoint_id")
                
                # Serialize checkpoint with error handling
                try:
                    type_name, serialized = self.serde.dumps_typed(checkpoint)
                except Exception as e:
                    print(f"[EmergencyPatch] Serde error: {e}, using JSON fallback")
                    type_name = "dict"
                    serialized = json.dumps(checkpoint).encode('utf-8')
                
                # Get metadata
                metadata_dict = get_checkpoint_metadata(config, metadata)
                
                # Ensure metadata is serializable
                if isinstance(metadata_dict, dict):
                    # Remove non-serializable values
                    cleaned_metadata = {}
                    for k, v in metadata_dict.items():
                        if v is None:
                            continue
                        if isinstance(v, (str, int, float, bool, list, dict)):
                            cleaned_metadata[k] = v
                        else:
                            cleaned_metadata[k] = str(v)
                    metadata_dict = cleaned_metadata
                
                # Save to database
                CheckpointModel.objects.update_or_create(
                    composite_id=f"{thread_id}-{checkpoint_ns}-{checkpoint['id']}",
                    thread_id=thread_id,
                    checkpoint_ns=checkpoint_ns,
                    checkpoint_id=checkpoint["id"],
                    defaults={
                        "parent_checkpoint_id": checkpoint_id,
                        "type": type_name,
                        "checkpoint": serialized,
                        "metadata": metadata_dict,
                    },
                )
                
                print(f"[EmergencyPatch] Successfully saved for thread {thread_id}")
                
                return {
                    "configurable": {
                        "thread_id": thread_id,
                        "checkpoint_ns": checkpoint_ns,
                        "checkpoint_id": checkpoint["id"],
                    }
                }
                
            except Exception as e:
                print(f"[EmergencyPatch.put] Critical error: {e}")
                # Return config anyway to prevent crash
                return config
        
        # Patch get_tuple method
        def emergency_get_tuple(self, config):
            try:
                print("[EmergencyPatch.get_tuple] Loading...")
                
                from langgraph.checkpoint.base import get_checkpoint_id
                from langgraph.checkpoint.django.checkpoint.models import (
                    Checkpoint as CheckpointModel,
                    Write as WriteModel
                )
                from django.db.models import Prefetch
                
                thread_id = config["configurable"]["thread_id"]
                checkpoint_id = get_checkpoint_id(config)
                checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
                
                queryset = CheckpointModel.objects.filter(
                    thread_id=thread_id,
                    checkpoint_ns=checkpoint_ns
                ).prefetch_related(
                    Prefetch(
                        "writes",
                        queryset=WriteModel.objects.order_by("task_id", "idx").only(
                            "task_id", "channel", "type", "value"
                        ),
                    )
                )
                
                if checkpoint_id:
                    obj = queryset.filter(checkpoint_id=checkpoint_id).first()
                else:
                    obj = queryset.order_by("-checkpoint_id").first()
                
                if not obj:
                    return None
                
                # Load checkpoint data with error handling
                checkpoint_data = None
                try:
                    checkpoint_data = self.serde.loads_typed((obj.type, obj.checkpoint))
                except Exception as e:
                    print(f"[EmergencyPatch.get_tuple] Load error: {e}")
                    # Try manual JSON load
                    if isinstance(obj.checkpoint, (bytes, memoryview)):
                        if isinstance(obj.checkpoint, memoryview):
                            data = obj.checkpoint.tobytes()
                        else:
                            data = obj.checkpoint
                        try:
                            checkpoint_data = json.loads(data.decode('utf-8', errors='replace'))
                        except:
                            checkpoint_data = {}
                
                # Load writes
                writes = []
                for write in obj.writes.all():
                    write_data = None
                    try:
                        write_data = self.serde.loads_typed((write.type, write.value))
                    except Exception as e:
                        print(f"[EmergencyPatch.get_tuple] Write load error: {e}")
                        write_data = {}
                    
                    writes.append((write.task_id, write.channel, write_data))
                
                from langgraph.checkpoint.base import CheckpointTuple
                
                return CheckpointTuple(
                    {
                        "configurable": {
                            "thread_id": thread_id,
                            "checkpoint_ns": checkpoint_ns,
                            "checkpoint_id": obj.checkpoint_id,
                        }
                    },
                    checkpoint_data or {},
                    obj.metadata or {},
                    (
                        {
                            "configurable": {
                                "thread_id": thread_id,
                                "checkpoint_ns": checkpoint_ns,
                                "checkpoint_id": obj.parent_checkpoint_id,
                            }
                        }
                        if obj.parent_checkpoint_id
                        else None
                    ),
                    writes,
                )
                
            except Exception as e:
                print(f"[EmergencyPatch.get_tuple] Critical error: {e}")
                return None
        
        # Apply patches
        DjangoSaver.put = emergency_put
        DjangoSaver.get_tuple = emergency_get_tuple
        
        print("✅ [Vercel] Emergency patch applied")
        return True
        
    except Exception as e:
        print(f"❌ [Vercel] Emergency patch failed: {e}")
        return False