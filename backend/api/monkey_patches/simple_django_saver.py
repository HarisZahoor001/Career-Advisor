# api/monkey_patches/simple_django_saver.py
import json
import sys

def create_simple_django_saver():
    """
    Create a simple DjangoSaver that uses plain JSON instead of JsonPlusSerializer
    """
    print("🔄 [Vercel] Creating simple DjangoSaver...")
    
    try:
        # Import the saver module
        import langgraph.checkpoint.django.saver as saver_module
        
        # Import required components
        from django.db import connection
        from django.db.models import Prefetch, Q
        from langchain_core.runnables import RunnableConfig
        from langgraph.checkpoint.base import (
            WRITES_IDX_MAP,
            BaseCheckpointSaver,
            ChannelVersions,
            Checkpoint,
            CheckpointMetadata,
            CheckpointTuple,
            get_checkpoint_id,
            get_checkpoint_metadata,
        )
        from packaging import version
        from langgraph.checkpoint.django.checkpoint.models import Checkpoint as CheckpointModel
        from langgraph.checkpoint.django.checkpoint.models import Write as WriteModel
        from langgraph.checkpoint.serde.base import SerializerProtocol
        from langgraph.checkpoint.serde.types import ChannelProtocol
        
        # Create Simple Serializer that doesn't use JsonPlusSerializer
        class SimpleJsonSerializer:
            """Simple JSON serializer that handles LangChain objects"""
            
            def dumps_typed(self, obj):
                """Serialize any object to typed format"""
                # Get object type
                obj_type = type(obj).__name__
                
                # Handle LangChain messages
                if hasattr(obj, '__class__') and 'Message' in obj.__class__.__name__:
                    # Create serializable representation
                    serializable = {
                        '_type': obj.__class__.__name__,
                        'content': getattr(obj, 'content', str(obj)),
                        'additional_kwargs': getattr(obj, 'additional_kwargs', {}),
                        'response_metadata': getattr(obj, 'response_metadata', {})
                    }
                    serialized = json.dumps(serializable).encode('utf-8')
                else:
                    # Default JSON serialization
                    serialized = json.dumps(obj, default=self._json_default).encode('utf-8')
                
                return (obj_type, serialized)
            
            def loads_typed(self, typed_data):
                """Load typed data"""
                if not typed_data or len(typed_data) != 2:
                    return None
                
                data_type, data = typed_data
                
                # Decode if bytes
                if isinstance(data, (bytes, memoryview)):
                    if isinstance(data, memoryview):
                        data = data.tobytes()
                    data = data.decode('utf-8', errors='replace')
                
                # Parse JSON
                parsed = json.loads(data)
                
                # Reconstruct LangChain objects if needed
                if isinstance(parsed, dict) and parsed.get('_type', '').endswith('Message'):
                    return self._reconstruct_message(parsed)
                
                return parsed
            
            def _json_default(self, obj):
                """Default JSON serializer"""
                if hasattr(obj, '__dict__'):
                    return obj.__dict__
                elif hasattr(obj, '__str__'):
                    return str(obj)
                else:
                    return repr(obj)
            
            def _reconstruct_message(self, data):
                """Reconstruct LangChain message from dict"""
                # Return as dict - the application should handle reconstruction
                return data
        
        # Create Simple DjangoSaver
        class SimpleDjangoSaver(BaseCheckpointSaver[str]):
            def __init__(self, *, serde: SerializerProtocol = None):
                self._check_sqlite_compatibility()
                super().__init__(serde=serde)
                print("[SimpleDjangoSaver] Initialized")
                
                # Use provided serde or create simple one
                if serde is None:
                    self._simple_serde = SimpleJsonSerializer()
                else:
                    self._simple_serde = serde
            
            def _check_sqlite_compatibility(self):
                if connection.vendor != "sqlite":
                    return

                with connection.cursor() as cursor:
                    cursor.execute("select sqlite_version();")
                    version_str = cursor.fetchone()[0]

                    if version.parse(version_str) < version.parse("3.9.0"):
                        raise RuntimeError(
                            f"SQLite {version_str} does not support JSONField (requires >= 3.9.0)"
                        )

                    try:
                        cursor.execute("SELECT json_extract('{\"a\": 1}', '$.a');")
                    except Exception as e:
                        raise RuntimeError(
                            f"SQLite JSON1 extension is not enabled or available: {e}"
                        )
            
            def get_tuple(self, config: RunnableConfig):
                """Simple get_tuple without JsonPlusSerializer"""
                try:
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

                    # Load data using simple serde
                    checkpoint_data = self._simple_serde.loads_typed((obj.type, obj.checkpoint))
                    
                    # Load writes
                    writes = []
                    for write in obj.writes.all():
                        write_data = self._simple_serde.loads_typed((write.type, write.value))
                        writes.append((write.task_id, write.channel, write_data))

                    return CheckpointTuple(
                        {
                            "configurable": {
                                "thread_id": thread_id,
                                "checkpoint_ns": checkpoint_ns,
                                "checkpoint_id": obj.checkpoint_id,
                            }
                        },
                        checkpoint_data,
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
                    print(f"[SimpleDjangoSaver.get_tuple] Error: {e}")
                    return None
            
            def put(self, config, checkpoint, metadata, new_versions):
                """Simple put method"""
                try:
                    thread_id = config["configurable"]["thread_id"]
                    checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
                    checkpoint_id = config["configurable"].get("checkpoint_id")
                    
                    # Serialize checkpoint
                    type_name, serialized = self._simple_serde.dumps_typed(checkpoint)
                    
                    # Handle metadata
                    metadata_dict = get_checkpoint_metadata(config, metadata)
                    
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
                    
                    print(f"[SimpleDjangoSaver] Saved checkpoint for {thread_id}")
                    
                    return {
                        "configurable": {
                            "thread_id": thread_id,
                            "checkpoint_ns": checkpoint_ns,
                            "checkpoint_id": checkpoint["id"],
                        }
                    }
                except Exception as e:
                    print(f"[SimpleDjangoSaver.put] Error: {e}")
                    return config
            
            # Implement other required methods minimally
            def list(self, *args, **kwargs):
                return []
            
            def put_writes(self, *args, **kwargs):
                pass
            
            def delete_thread(self, thread_id):
                CheckpointModel.objects.filter(thread_id=thread_id).delete()
            
            def get_next_version(self, *args, **kwargs):
                return "1.0"
        
        # Replace DjangoSaver
        saver_module.DjangoSaver = SimpleDjangoSaver
        print("✅ [Vercel] SimpleDjangoSaver installed")
        
        return True
        
    except Exception as e:
        print(f"❌ [Vercel] Error creating simple saver: {e}")
        import traceback
        traceback.print_exc()
        return False