# In your views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny  # For testing, use AllowAny
from rest_framework.response import Response
from rest_framework import status
from langgraph.checkpoint.django.saver import DjangoSaver
from langgraph.graph import StateGraph
from langgraph.checkpoint.base import BaseCheckpointSaver
from langchain_core.runnables import RunnableConfig
import logging
import json

logger = logging.getLogger(__name__)

# Define MessagesStates
from typing import TypedDict, List, Dict, Any

class MessagesState(TypedDict):
    messages: List[str]

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Temporarily allow anyone for testing
def test_chat(request):
    """
    Simple test endpoint to verify DjangoSaver works
    """
    try:
        logger.info("Starting test_chat endpoint")
        
        # Initialize the checkpoint saver
        logger.info("Initializing DjangoSaver...")
        checkpointer = DjangoSaver()
        logger.info("DjangoSaver initialized successfully")
        
        # Create your graph with checkpointing
        def my_node(state: MessagesState):
            logger.info(f"Processing node with state: {state}")
            # Just add a simple processed message
            return {"messages": state["messages"] + ["processed"]}
        
        # Build the graph
        logger.info("Building graph...")
        graph = StateGraph(MessagesState)
        graph.add_node("process", my_node)
        graph.set_entry_point("process")
        
        # Compile with checkpointing
        logger.info("Compiling graph with checkpointer...")
        app = graph.compile(checkpointer=checkpointer)
        logger.info("Graph compiled successfully")
        
        # Use with thread configuration
        config = RunnableConfig(
            configurable={
                "thread_id": "conversation-1",
                "checkpoint_ns": "default"
            }
        )
        
        logger.info(f"Using config: {config}")
        
        # Run the graph
        logger.info("Invoking graph...")
        result = app.invoke({"messages": ["hello"]}, config=config)
        logger.info(f"Graph result: {result}")
        
        # Try a second time to see if checkpointing works
        logger.info("Running second invocation...")
        result2 = app.invoke({"messages": result["messages"] + ["hello again"]}, config=config)
        logger.info(f"Second result: {result2}")
        
        # Check if we can retrieve the checkpoint
        logger.info("Trying to retrieve checkpoint...")
        try:
            checkpoint = checkpointer.get(config)
            logger.info(f"Checkpoint retrieved: {checkpoint is not None}")
            if checkpoint:
                logger.info(f"Checkpoint keys: {checkpoint.keys() if isinstance(checkpoint, dict) else 'Not a dict'}")
        except Exception as e:
            logger.warning(f"Could not retrieve checkpoint: {e}")
        
        return Response({
            'status': 'success',
            'first_result': result,
            'second_result': result2,
            'message': 'DjangoSaver test completed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error in test_chat: {e}", exc_info=True)
        return Response({
            'status': 'error',
            'error': str(e),
            'message': 'DjangoSaver test failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def test_saver_directly(request):
    """
    Test DjangoSaver directly without LangGraph
    """
    try:
        logger.info("Testing DjangoSaver directly")
        
        # Initialize saver
        checkpointer = DjangoSaver()
        
        # Test config
        config = {
            "configurable": {
                "thread_id": "test-thread-123",
                "checkpoint_ns": "test"
            }
        }
        
        # Test data
        test_checkpoint = {
            "id": "test-checkpoint-1",
            "ts": "2024-01-01T00:00:00Z",
            "channel_values": {
                "messages": ["hello", "world"]
            }
        }
        
        # Try to put a checkpoint
        from langgraph.checkpoint.base import CheckpointMetadata
        
        metadata = CheckpointMetadata(
            source="test",
            step=1,
            writes={"messages": ["hello", "world"]},
            config=config
        )
        
        logger.info("Attempting to save checkpoint...")
        
        # Note: The exact method signature might vary
        # Try different approaches
        
        # Approach 1: Try put method
        try:
            logger.info("Trying put method...")
            result = checkpointer.put(config, test_checkpoint, metadata, {})
            logger.info(f"Put method succeeded: {result}")
            method_used = "put"
        except Exception as e1:
            logger.warning(f"Put method failed: {e1}")
            
            # Approach 2: Try save_checkpoint if exists
            try:
                if hasattr(checkpointer, 'save_checkpoint'):
                    logger.info("Trying save_checkpoint method...")
                    result = checkpointer.save_checkpoint(config, test_checkpoint, metadata)
                    logger.info(f"save_checkpoint succeeded: {result}")
                    method_used = "save_checkpoint"
                else:
                    raise AttributeError("No save_checkpoint method")
            except Exception as e2:
                logger.warning(f"save_checkpoint failed: {e2}")
                method_used = "none"
        
        # Try to retrieve
        logger.info("Trying to retrieve checkpoint...")
        retrieved = checkpointer.get(config)
        
        return Response({
            'status': 'success',
            'method_used': method_used,
            'checkpoint_saved': retrieved is not None,
            'retrieved_keys': list(retrieved.keys()) if isinstance(retrieved, dict) else str(type(retrieved)),
            'config': config
        })
        
    except Exception as e:
        logger.error(f"Error in test_saver_directly: {e}", exc_info=True)
        return Response({
            'status': 'error',
            'error': str(e),
            'traceback': str(e.__traceback__)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def inspect_saver_methods(request):
    """
    Inspect what methods DjangoSaver has
    """
    try:
        checkpointer = DjangoSaver()
        
        methods = []
        for attr_name in dir(checkpointer):
            if not attr_name.startswith('_'):
                attr = getattr(checkpointer, attr_name)
                if callable(attr):
                    methods.append({
                        'name': attr_name,
                        'type': 'method',
                        'signature': str(attr)
                    })
                else:
                    methods.append({
                        'name': attr_name,
                        'type': 'attribute',
                        'value': str(attr)[:100]  # Truncate long values
                    })
        
        # Also inspect JsonPlusSerializer
        from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer
        serializer = JsonPlusSerializer()
        
        serializer_methods = []
        for attr_name in dir(serializer):
            if not attr_name.startswith('_'):
                attr = getattr(serializer, attr_name)
                if callable(attr):
                    serializer_methods.append({
                        'name': attr_name,
                        'type': 'method'
                    })
        
        return Response({
            'saver_methods': methods,
            'serializer_methods': serializer_methods,
            'saver_class': str(type(checkpointer)),
            'serializer_class': str(type(serializer))
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def debug_serializer(request):
    """
    Debug the JsonPlusSerializer issue
    """
    try:
        from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer
        
        serializer = JsonPlusSerializer()
        
        # Test data
        test_data = {"test": "data", "nested": {"key": "value"}}
        
        # Check available methods
        methods = [m for m in dir(serializer) if not m.startswith('_')]
        
        # Try to serialize
        results = {}
        for method_name in ['dump', 'dumps', 'encode', 'serialize']:
            if hasattr(serializer, method_name):
                try:
                    method = getattr(serializer, method_name)
                    result = method(test_data)
                    results[method_name] = {
                        'success': True,
                        'result_type': type(result).__name__,
                        'result_preview': str(result)[:100]
                    }
                except Exception as e:
                    results[method_name] = {
                        'success': False,
                        'error': str(e)
                    }
        
        return Response({
            'available_methods': methods,
            'test_results': results,
            'test_data': test_data
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'traceback': str(e.__traceback__)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)