# api/monkey_patches/jsonplus_fix.py
import json
import sys
import importlib

def fix_jsonplus_serializer():
    """
    Directly monkey patch JsonPlusSerializer to add missing loads/dumps methods
    """
    print("🔧 [Vercel] Fixing JsonPlusSerializer...")
    
    try:
        # Import JsonPlusSerializer
        from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer
        
        # Store original class
        original_class = JsonPlusSerializer
        
        # Check what methods exist
        original_methods = [m for m in dir(JsonPlusSerializer) if not m.startswith('_')]
        print(f"[Vercel] Original JsonPlusSerializer methods: {original_methods}")
        
        # Create fixed class
        class FixedJsonPlusSerializer(original_class):
            """
            Fixed JsonPlusSerializer with loads/dumps compatibility
            """
            
            def loads(self, data):
                """
                Deserialize data - provides compatibility for missing loads method
                """
                # Try available methods
                if hasattr(self, 'load') and callable(self.load):
                    return self.load(data)
                elif hasattr(self, 'deserialize') and callable(self.deserialize):
                    return self.deserialize(data)
                else:
                    # Fallback to JSON
                    if isinstance(data, bytes):
                        data = data.decode('utf-8', errors='replace')
                    return json.loads(data)
            
            def dumps(self, obj):
                """
                Serialize object - provides compatibility for missing dumps method
                """
                # Try available methods
                if hasattr(self, 'dump') and callable(self.dump):
                    result = self.dump(obj)
                elif hasattr(self, 'serialize') and callable(self.serialize):
                    result = self.serialize(obj)
                elif hasattr(self, 'encode') and callable(self.encode):
                    result = self.encode(obj)
                else:
                    # Fallback to JSON
                    result = json.dumps(obj, ensure_ascii=False).encode('utf-8')
                
                # Ensure bytes
                if isinstance(result, str):
                    result = result.encode('utf-8')
                return result
            
            def loads_typed(self, typed_data):
                """
                Handle typed data loading
                """
                if not typed_data or len(typed_data) != 2:
                    return None
                
                data_type, data = typed_data
                
                # Use our loads method
                loaded = self.loads(data)
                return loaded
            
            def dumps_typed(self, obj):
                """
                Handle typed data dumping
                """
                # Get type name
                type_name = type(obj).__name__
                
                # Use our dumps method
                serialized = self.dumps(obj)
                
                return (type_name, serialized)
        
        # Replace the class in its module
        import langgraph.checkpoint.serde.jsonplus as jsonplus_module
        jsonplus_module.JsonPlusSerializer = FixedJsonPlusSerializer
        
        # Also update the imported reference
        sys.modules['langgraph.checkpoint.serde.jsonplus'].JsonPlusSerializer = FixedJsonPlusSerializer
        
        print(f"✅ [Vercel] JsonPlusSerializer fixed with loads/dumps methods")
        return True
        
    except ImportError as e:
        print(f"❌ [Vercel] Could not import JsonPlusSerializer: {e}")
        return False
    except Exception as e:
        print(f"❌ [Vercel] Error fixing JsonPlusSerializer: {e}")
        import traceback
        traceback.print_exc()
        return False