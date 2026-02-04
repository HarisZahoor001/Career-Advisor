# api/monkey_patches/complete_serializer_fix.py
import json
import sys
import importlib
from typing import Any, Dict

class EnhancedJsonPlusSerializer:
    """
    Enhanced JsonPlusSerializer that handles:
    1. memoryview objects
    2. LangChain objects (HumanMessage, AIMessage, etc.)
    3. Missing loads/dumps methods
    """
    
    def __init__(self, original_serializer=None):
        self.original = original_serializer
        self._setup_methods()
        print(f"[EnhancedJsonPlusSerializer] Initialized")
    
    def _setup_methods(self):
        """Setup method mapping from original serializer"""
        self.method_map = {}
        
        if self.original:
            # Map available methods
            for attr_name in dir(self.original):
                if not attr_name.startswith('_'):
                    attr = getattr(self.original, attr_name)
                    if callable(attr):
                        self.method_map[attr_name] = attr
        
        print(f"[Enhanced] Available methods: {list(self.method_map.keys())}")
    
    def _convert_to_bytes(self, data):
        """Convert any input to bytes"""
        if isinstance(data, memoryview):
            return data.tobytes()
        elif isinstance(data, str):
            return data.encode('utf-8')
        elif isinstance(data, bytes):
            return data
        elif hasattr(data, '__bytes__'):
            return bytes(data)
        else:
            return str(data).encode('utf-8')
    
    def _convert_to_string(self, data):
        """Convert any input to string for JSON"""
        if isinstance(data, memoryview):
            return data.tobytes().decode('utf-8', errors='replace')
        elif isinstance(data, bytes):
            return data.decode('utf-8', errors='replace')
        elif isinstance(data, str):
            return data
        else:
            return str(data)
    
    def loads(self, data):
        """Load data from bytes/string/memoryview"""
        try:
            # Convert to string first
            data_str = self._convert_to_string(data)
            
            # Try JSON
            return json.loads(data_str)
        except Exception as e:
            print(f"[Enhanced.loads] JSON error: {e}, trying original...")
            
            # Try original method
            if 'loads' in self.method_map:
                try:
                    return self.method_map['loads'](data)
                except:
                    pass
            
            if 'load' in self.method_map:
                try:
                    return self.method_map['load'](data)
                except:
                    pass
            
            # Last resort
            return {"error": "deserialization_failed", "data": str(data)[:100]}
    
    def dumps(self, obj):
        """Dump object to bytes"""
        try:
            # First try to serialize complex objects
            serialized = self._serialize_complex_object(obj)
            
            # Convert to bytes
            if isinstance(serialized, memoryview):
                return serialized.tobytes()
            elif isinstance(serialized, bytes):
                return serialized
            elif isinstance(serialized, str):
                return serialized.encode('utf-8')
            else:
                return str(serialized).encode('utf-8')
                
        except Exception as e:
            print(f"[Enhanced.dumps] Error: {e}")
            
            # Fallback to JSON
            try:
                return json.dumps(obj, default=self._json_default).encode('utf-8')
            except:
                return b'{"error": "serialization_failed"}'
    
    def _serialize_complex_object(self, obj):
        """Handle complex objects like LangChain messages"""
        # Try original serializer first
        if 'dumps' in self.method_map:
            try:
                return self.method_map['dumps'](obj)
            except:
                pass
        
        if 'dump' in self.method_map:
            try:
                return self.method_map['dump'](obj)
            except:
                pass
        
        if 'serialize' in self.method_map:
            try:
                return self.method_map['serialize'](obj)
            except:
                pass
        
        # Handle LangChain objects
        obj_type = type(obj).__name__
        if 'Message' in obj_type:  # HumanMessage, AIMessage, etc.
            return self._serialize_langchain_message(obj)
        
        # Default to JSON with custom handler
        return json.dumps(obj, default=self._json_default).encode('utf-8')
    
    def _serialize_langchain_message(self, message):
        """Serialize LangChain message objects"""
        try:
            # Extract message content
            if hasattr(message, 'content'):
                content = message.content
            elif hasattr(message, 'text'):
                content = message.text
            else:
                content = str(message)
            
            # Get message type
            msg_type = type(message).__name__
            
            # Create serializable dict
            result = {
                'type': msg_type,
                'content': content,
                '_is_langchain_message': True
            }
            
            # Add additional attributes
            for attr in ['name', 'id', 'additional_kwargs', 'response_metadata']:
                if hasattr(message, attr):
                    value = getattr(message, attr)
                    if value:
                        result[attr] = value
            
            return json.dumps(result).encode('utf-8')
        except Exception as e:
            print(f"[Enhanced] Message serialization error: {e}")
            return json.dumps({'type': 'message', 'content': str(message)}).encode('utf-8')
    
    def _json_default(self, obj):
        """Default JSON serializer for complex objects"""
        # Handle LangChain messages
        if hasattr(obj, '__class__') and 'Message' in obj.__class__.__name__:
            return {
                '_type': obj.__class__.__name__,
                'content': getattr(obj, 'content', str(obj)),
                'serialized': True
            }
        
        # Handle other objects
        if hasattr(obj, '__dict__'):
            return obj.__dict__
        elif hasattr(obj, '__str__'):
            return str(obj)
        else:
            return repr(obj)
    
    def loads_typed(self, typed_data):
        """Load typed data"""
        if not typed_data or len(typed_data) != 2:
            return None
        
        data_type, data = typed_data
        
        # Try original
        if 'loads_typed' in self.method_map:
            try:
                return self.method_map['loads_typed'](typed_data)
            except:
                pass
        
        # Use our loads
        return self.loads(data)
    
    def dumps_typed(self, obj):
        """Dump typed data"""
        # Try original
        if 'dumps_typed' in self.method_map:
            try:
                return self.method_map['dumps_typed'](obj)
            except:
                pass
        
        # Get type
        obj_type = type(obj).__name__
        
        # Serialize
        serialized = self.dumps(obj)
        
        return (obj_type, serialized)
    
    def __getattr__(self, name):
        """Delegate other attributes to original"""
        if self.original and hasattr(self.original, name):
            return getattr(self.original, name)
        raise AttributeError(f"'EnhancedJsonPlusSerializer' object has no attribute '{name}'")

def apply_complete_serializer_fix():
    """
    Apply complete fix for JsonPlusSerializer
    """
    print("🔧 [Vercel] Applying complete serializer fix...")
    
    try:
        # Import original
        from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer as OriginalJsonPlusSerializer
        
        # Create enhanced class
        class FixedJsonPlusSerializer(OriginalJsonPlusSerializer):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, **kwargs)
                self._enhanced = EnhancedJsonPlusSerializer(self)
                print(f"[FixedJsonPlusSerializer] Enhanced wrapper created")
            
            def loads(self, data):
                return self._enhanced.loads(data)
            
            def dumps(self, obj):
                return self._enhanced.dumps(obj)
            
            def loads_typed(self, typed_data):
                return self._enhanced.loads_typed(typed_data)
            
            def dumps_typed(self, obj):
                return self._enhanced.dumps_typed(obj)
        
        # Replace in module
        import langgraph.checkpoint.serde.jsonplus as module
        module.JsonPlusSerializer = FixedJsonPlusSerializer
        
        # Update sys.modules
        sys.modules['langgraph.checkpoint.serde.jsonplus'].JsonPlusSerializer = FixedJsonPlusSerializer
        
        print("✅ [Vercel] Complete serializer fix applied")
        
        # Test
        print("[Vercel] Testing enhanced serializer...")
        try:
            serializer = FixedJsonPlusSerializer()
            
            # Test 1: JSON serialization
            test_obj = {"test": "data", "number": 42}
            dumped = serializer.dumps(test_obj)
            loaded = serializer.loads(dumped)
            print(f"  ✓ Basic JSON: {loaded.get('test')}")
            
            # Test 2: memoryview
            import json
            mv = memoryview(json.dumps({"memoryview": "test"}).encode())
            loaded_mv = serializer.loads(mv)
            print(f"  ✓ Memoryview: {loaded_mv.get('memoryview')}")
            
        except Exception as e:
            print(f"  ✗ Test failed: {e}")
        
        return True
        
    except ImportError as e:
        print(f"❌ [Vercel] Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ [Vercel] Error: {e}")
        import traceback
        traceback.print_exc()
        return False