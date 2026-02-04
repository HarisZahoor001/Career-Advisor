# api/monkey_patches/django_saver_override.py
import json
import random
from collections.abc import Sequence
from typing import Any, Dict, Iterator, Optional, Tuple, cast

def override_django_saver():
    """
    Completely override DjangoSaver with fixed version
    """
    print("🔄 [Vercel] Overriding DjangoSaver...")
    
    try:
        # Import target
        import langgraph.checkpoint.django.saver as saver_module
        
        # Import all dependencies
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
        
        # Import our fixed JsonPlusSerializer
        from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer
        
        print("✅ [Vercel] All dependencies imported")
        
        # Create Fixed DjangoSaver
        class FixedDjangoSaver(BaseCheckpointSaver[str]):
            def __init__(
                    self,
                    *,
                    serde: Optional[SerializerProtocol] = None,
            ):
                # Call parent
                super().__init__(serde=serde)
                
                # Initialize JsonPlusSerializer with error handling
                try:
                    self.jsonplus_serde = JsonPlusSerializer()
                    print("[Vercel] JsonPlusSerializer initialized")
                except Exception as e:
                    print(f"[Vercel] Warning: JsonPlusSerializer init failed: {e}")
                    self.jsonplus_serde = None
            
            def _check_sqlite_compatibility(self):
                """SQLite compatibility check"""
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
            
            def _safe_serialize_metadata(self, metadata_dict):
                """Safely serialize metadata with fallbacks"""
                if not metadata_dict:
                    return {}
                
                try:
                    # Try JsonPlusSerializer if available
                    if self.jsonplus_serde:
                        # Check available methods
                        if hasattr(self.jsonplus_serde, 'dump'):
                            result = self.jsonplus_serde.dump(metadata_dict)
                        elif hasattr(self.jsonplus_serde, 'serialize'):
                            result = self.jsonplus_serde.serialize(metadata_dict)
                        elif hasattr(self.jsonplus_serde, 'encode'):
                            result = self.jsonplus_serde.encode(metadata_dict)
                        else:
                            result = json.dumps(metadata_dict, ensure_ascii=False).encode('utf-8')
                    else:
                        result = json.dumps(metadata_dict, ensure_ascii=False).encode('utf-8')
                    
                    # Convert to string
                    if isinstance(result, bytes):
                        result_str = result.decode('utf-8', errors='replace')
                    else:
                        result_str = str(result)
                    
                    # Clean and parse
                    result_str = result_str.replace('\u0000', '')
                    
                    if result_str:
                        return json.loads(result_str)
                    else:
                        return {}
                        
                except Exception as e:
                    print(f"[Vercel] Metadata serialization error: {e}")
                    # Return cleaned dict
                    return self._clean_dict(metadata_dict)
            
            def _clean_dict(self, data):
                """Clean dictionary for safe JSON serialization"""
                if not isinstance(data, dict):
                    return data
                
                cleaned = {}
                for key, value in data.items():
                    if value is None:
                        continue
                    
                    if isinstance(value, (bytes, bytearray)):
                        try:
                            cleaned[key] = value.decode('utf-8', errors='ignore')
                        except:
                            cleaned[key] = str(value)
                    elif isinstance(value, dict):
                        cleaned[key] = self._clean_dict(value)
                    elif isinstance(value, (list, tuple)):
                        cleaned[key] = [
                            self._clean_dict(item) if isinstance(item, dict) else item
                            for item in value
                        ]
                    elif isinstance(value, str):
                        cleaned[key] = value.replace('\u0000', '')
                    else:
                        cleaned[key] = value
                
                return cleaned
            
            def get_tuple(self, config: RunnableConfig) -> Optional[CheckpointTuple]:
                """Fixed get_tuple - uses serde directly"""
                try:
                    thread_id = config["configurable"]["thread_id"]
                    checkpoint_id = get_checkpoint_id(config)
                    checkpoint_ns = config["configurable"].get("checkpoint_ns", "")

                    queryset = CheckpointModel.objects.filter(thread_id=thread_id, checkpoint_ns=checkpoint_ns)
                    queryset = queryset.prefetch_related(
                        Prefetch(
                            "writes",
                            queryset=WriteModel.objects.order_by("task_id", "idx").only("task_id", "channel", "type", "value"),
                        )
                    )

                    if checkpoint_id:
                        obj = queryset.filter(checkpoint_id=checkpoint_id).first()
                    else:
                        obj = queryset.order_by("-checkpoint_id").first()

                    if not obj:
                        return None

                    # Get metadata from database
                    metadata_dict = obj.metadata if obj.metadata else {}
                    
                    # Load checkpoint using serde (NOT jsonplus_serde)
                    checkpoint_data = self.serde.loads_typed((obj.type, obj.checkpoint))
                    
                    # Load writes using serde
                    writes = []
                    for write in obj.writes.all():
                        write_data = self.serde.loads_typed((write.type, write.value))
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
                        cast(CheckpointMetadata, metadata_dict),
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
                    print(f"[Vercel] get_tuple error: {e}")
                    return None
            
            def put(self, config: RunnableConfig, checkpoint: Checkpoint, 
                   metadata: CheckpointMetadata, new_versions: ChannelVersions) -> RunnableConfig:
                """Fixed put method"""
                try:
                    configurable = config["configurable"].copy()
                    thread_id = configurable.pop("thread_id")
                    checkpoint_ns = configurable.pop("checkpoint_ns")
                    checkpoint_id = configurable.pop("checkpoint_id", configurable.pop("thread_ts", None))
                    
                    # Use serde for checkpoint serialization
                    type_, serialized_checkpoint = self.serde.dumps_typed(checkpoint)
                    
                    # Get and serialize metadata
                    metadata_dict = get_checkpoint_metadata(config, metadata)
                    serialized_metadata = self._safe_serialize_metadata(metadata_dict)
                    
                    # Save to database
                    CheckpointModel.objects.update_or_create(
                        composite_id=f"{thread_id}-{checkpoint_ns}-{checkpoint['id']}",
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
                    
                    print(f"[Vercel] Checkpoint saved for thread: {thread_id}")
                    
                    return {
                        "configurable": {
                            "thread_id": thread_id,
                            "checkpoint_ns": checkpoint_ns,
                            "checkpoint_id": checkpoint["id"],
                        }
                    }
                    
                except Exception as e:
                    print(f"[Vercel] put error: {e}")
                    # Return minimal config
                    return {
                        "configurable": {
                            "thread_id": config["configurable"]["thread_id"],
                            "checkpoint_ns": config["configurable"].get("checkpoint_ns", ""),
                            "checkpoint_id": checkpoint["id"],
                        }
                    }
            
            # Other methods remain the same as your working version
            def list(self, config, *, filter=None, before=None, limit=None):
                """List checkpoints"""
                queryset = CheckpointModel.objects.order_by("-checkpoint_id")
                queryset = queryset.prefetch_related(
                    Prefetch(
                        "writes",
                        queryset=WriteModel.objects.order_by("task_id", "idx").only("task_id", "channel", "type", "value"),
                    )
                )

                if config:
                    queryset = queryset.filter(thread_id=config["configurable"]["thread_id"])
                    checkpoint_ns = config["configurable"].get("checkpoint_ns")
                    if checkpoint_ns is not None:
                        queryset = queryset.filter(checkpoint_ns=checkpoint_ns)
                    if checkpoint_id := get_checkpoint_id(config):
                        queryset = queryset.filter(checkpoint_id=checkpoint_id)

                if filter:
                    metadata_filters = Q()
                    for key, value in filter.items():
                        metadata_filters &= Q(**{f"metadata__{key}": value})
                    if metadata_filters:
                        queryset = queryset.filter(metadata_filters)

                if before:
                    before_checkpoint_id = get_checkpoint_id(before)
                    if before_checkpoint_id:
                        queryset = queryset.filter(checkpoint_id__lt=before_checkpoint_id)

                if limit:
                    queryset = queryset[:limit]

                for obj in queryset:
                    metadata_dict = obj.metadata if obj.metadata else {}
                    
                    # Load using serde
                    checkpoint_data = self.serde.loads_typed((obj.type, obj.checkpoint))
                    
                    writes = []
                    for write in obj.writes.all():
                        write_data = self.serde.loads_typed((write.type, write.value))
                        writes.append((write.task_id, write.channel, write_data))

                    yield CheckpointTuple(
                        {
                            "configurable": {
                                "thread_id": obj.thread_id,
                                "checkpoint_ns": obj.checkpoint_ns,
                                "checkpoint_id": obj.checkpoint_id,
                            }
                        },
                        checkpoint_data,
                        cast(CheckpointMetadata, metadata_dict),
                        (
                            {
                                "configurable": {
                                    "thread_id": obj.thread_id,
                                    "checkpoint_ns": obj.checkpoint_ns,
                                    "checkpoint_id": obj.parent_checkpoint_id,
                                }
                            }
                            if obj.parent_checkpoint_id
                            else None
                        ),
                        writes,
                    )
            
            def put_writes(self, config, writes, task_id, task_path=""):
                """Save writes"""
                thread_id = config["configurable"]["thread_id"]
                checkpoint_ns = config["configurable"]["checkpoint_ns"]
                checkpoint_id = config["configurable"]["checkpoint_id"]

                writes_list = []
                for idx, (channel, value) in enumerate(writes):
                    type_, value = self.serde.dumps_typed(value)
                    writes_list.append(
                        WriteModel(
                            checkpoint_id=f"{thread_id}-{checkpoint_ns}-{checkpoint_id}",
                            task_id=task_id,
                            task_path=task_path,
                            idx=WRITES_IDX_MAP.get(channel, idx),
                            channel=channel,
                            type=type_,
                            value=value,
                        )
                    )

                if all(w[0] in WRITES_IDX_MAP for w in writes):
                    WriteModel.objects.bulk_create(
                        writes_list,
                        update_conflicts=True,
                        update_fields=["channel", "type", "value"],
                        unique_fields=["checkpoint_id", "task_id", "idx"],
                    )
                else:
                    WriteModel.objects.bulk_create(
                        writes_list,
                        ignore_conflicts=True,
                    )
            
            def delete_thread(self, thread_id):
                """Delete thread"""
                CheckpointModel.objects.filter(thread_id=thread_id).delete()
            
            def get_next_version(self, current, channel):
                """Get next version"""
                if current is None:
                    current_v = 0
                elif isinstance(current, int):
                    current_v = current
                else:
                    current_v = int(current.split(".")[0])
                next_v = current_v + 1
                next_h = random.random()
                return f"{next_v:032}.{next_h:016}"
        
        # Replace the DjangoSaver class
        saver_module.DjangoSaver = FixedDjangoSaver
        
        # Update sys.modules
        for mod_name, mod in list(sys.modules.items()):
            if mod is not None and hasattr(mod, 'DjangoSaver'):
                try:
                    if getattr(mod, 'DjangoSaver', None).__name__ == 'DjangoSaver':
                        setattr(mod, 'DjangoSaver', FixedDjangoSaver)
                except:
                    pass
        
        print("✅ [Vercel] FixedDjangoSaver installed successfully")
        return True
        
    except ImportError as e:
        print(f"❌ [Vercel] Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ [Vercel] Error: {e}")
        import traceback
        traceback.print_exc()
        return False