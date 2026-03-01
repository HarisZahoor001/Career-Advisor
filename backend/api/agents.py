# agents.py
import os
from typing import List, Dict, Any, TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import add_messages
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.django.saver import DjangoSaver
from langchain_core.runnables import RunnableConfig
from dotenv import load_dotenv
import logging
import json

logger = logging.getLogger(__name__)
load_dotenv()

# Define the state for our chat
class ChatState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]

class UserChatAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            api_key=os.getenv("OPENAI_API_KEY"),
            max_tokens=500
        )
        
        # Initialize DjangoSaver
        try:
            self.checkpointer = DjangoSaver()
            logger.info("DjangoSaver initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize DjangoSaver: {e}")
            raise
        
        self.graph = self._build_graph()
        self.user_profiles = {}  # Store user profiles
    
    def _build_graph(self):
        """Build the LangGraph for chat"""
        # Define chat node with career counseling focus
        def chat_node(state: ChatState):
            """Process chat and return response - Specialized for career counseling"""
            messages = state["messages"]
            if not messages:
                return {"messages": []}
            
            try:
                # Get user_id from context (you might need to pass this differently)
                # For now, we'll extract it from the last human message if possible
                user_id = None
                user_profile = {}
                
                # Extract content from messages (handling JSON if present)
                processed_messages = []
                for msg in messages:
                    if isinstance(msg, HumanMessage):
                        content = msg.content
                        if isinstance(content, str):
                            try:
                                parsed = json.loads(content)
                                if isinstance(parsed, dict) and "user_id" in parsed:
                                    user_id = parsed.get("user_id")
                                    content = parsed.get("message", content)
                            except json.JSONDecodeError:
                                pass
                        processed_messages.append(HumanMessage(content=content))
                    else:
                        processed_messages.append(msg)
                
                # Get user profile if available
                if user_id:
                    user_profile = self.user_profiles.get(user_id, {})
                
                # Prepare messages with system prompt
                system_prompt = self._get_system_prompt(user_profile)
                system_message = SystemMessage(content=system_prompt)
                
                # Add system message at the beginning
                llm_messages = [system_message] + processed_messages
                
                # Get response from LLM
                response = self.llm.invoke(llm_messages)
                
                # Add AI response to messages (without system message)
                return {"messages": messages + [AIMessage(content=response.content)]}
            except Exception as e:
                logger.error(f"LLM Error: {e}")
                return {"messages": messages + [AIMessage(content="I apologize, but I'm having trouble processing your career-related question. Please try again.")]}
        
        # Build graph
        workflow = StateGraph(ChatState)
        workflow.add_node("chat", chat_node)
        workflow.add_edge(START, "chat")
        workflow.add_edge("chat", END)
        
        # Compile with checkpointer
        return workflow.compile(checkpointer=self.checkpointer)
    
    def _get_system_prompt(self, user_profile: Dict[str, Any] = None) -> str:
        """Create a system prompt for career counseling agent"""
        profile_info = ""
        if user_profile:
            profile_info = f"""
USER PROFILE:
- Name: {user_profile.get('name', 'Not provided')}
- Age: {user_profile.get('age', 'Not provided')}
- Education: {user_profile.get('education', 'Not provided')}
- Current Role: {user_profile.get('current_role', 'Not provided')}
- Skills: {', '.join(user_profile.get('skills', [])) if user_profile.get('skills') else 'Not provided'}
- Experience: {user_profile.get('experience', 'Not provided')}
- Career Goals: {user_profile.get('career_goals', 'Not provided')}
"""
        
        return f"""You are CareerGuide AI, a specialized career counseling assistant. Your ONLY purpose is to help users with career-related matters.

{profile_info}

STRICT GUIDELINES - YOU MUST:
1. ONLY discuss topics related to careers, jobs, education, skills, professional development, and workplace issues
2. Politely decline and redirect ANY non-career related questions back to career topics
3. Provide practical, actionable advice for career advancement
4. Suggest relevant skills, certifications, and educational paths
5. Help with resume building, interview preparation, and job search strategies
6. Discuss work-life balance, career transitions, and professional networking
7. Consider the user's profile when giving personalized advice

AREAS YOU CAN HELP WITH:
- Career path planning and exploration
- Skill development and gap analysis
- Resume/CV review and optimization
- Interview preparation and mock interviews
- Job search strategies and networking
- Salary negotiation advice
- Professional certification guidance
- Work-related stress and burnout management
- Career transitions and pivots
- Industry trends and future-proofing skills
- Educational planning for career advancement

AREAS TO AVOID (Politely redirect if asked):
- Personal relationships, dating, or family advice
- Medical, legal, or financial advice (beyond career implications)
- Political or religious discussions
- Entertainment, sports, or leisure activities
- General trivia or unrelated topics

RESPONSE STYLE:
- Be professional yet empathetic
- Ask clarifying questions when needed
- Provide concrete examples and actionable steps
- Reference the user's profile when relevant
- Use bullet points for complex advice
- Suggest timelines and resources

If a user asks about non-career topics, respond:
"I'm CareerGuide AI, specialized in career counseling. I can help you with career-related questions like [mention 2-3 career topics]. What career guidance are you looking for today?"

Now, provide focused career counseling assistance."""
    
    def get_user_thread_id(self, user_id: str) -> str:
        """Get the thread ID for a user (one thread per user)"""
        return f"user_{user_id}_career_chat"
    
    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> None:
        """Update or create user profile for personalized career counseling"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {}
        
        self.user_profiles[user_id].update(profile_data)
        logger.info(f"Updated profile for user {user_id}")
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile"""
        return self.user_profiles.get(user_id, {})
    
    def chat(self, user_id: str, message: str, profile_update: Dict[str, Any] = None) -> Dict[str, Any]:
        """Send a message in user's personal chat thread with career counseling focus"""
        # Update user profile if provided
        if profile_update:
            self.update_user_profile(user_id, profile_update)
        
        # Get user's thread ID
        thread_id = self.get_user_thread_id(user_id)
        
        # Create config
        config = {
            "configurable": {
                "thread_id": thread_id,
                "checkpoint_ns": ""
            }
        }
        
        # Get existing messages first
        existing_messages = self.get_user_messages(user_id)
        
        # Convert existing messages to BaseMessage format
        messages_for_llm = []
        for msg in existing_messages:
            if msg["type"] == "human":
                messages_for_llm.append(HumanMessage(content=msg["content"]))
            elif msg["type"] == "ai":
                messages_for_llm.append(AIMessage(content=msg["content"]))
        
        # Get user profile for context
        user_profile = self.get_user_profile(user_id)
        
        # Prepare system prompt
        system_prompt = self._get_system_prompt(user_profile)
        system_message = SystemMessage(content=system_prompt)
        
        # Add new user message as plain text (not JSON)
        messages_for_llm.append(HumanMessage(content=message))
        
        try:
            # Invoke the graph
            result = self.graph.invoke(
                {"messages": messages_for_llm}, 
                config=config
            )
            
            # Get all messages from result
            all_messages = result.get("messages", [])
            
            # Get the last message (AI response)
            last_message = all_messages[-1] if all_messages else None
            
            if last_message and hasattr(last_message, 'type') and last_message.type == "ai":
                response = last_message.content
            else:
                response = "I couldn't generate a career-focused response."
            
            # Convert messages to simple format
            messages_list = []
            for msg in all_messages:
                if hasattr(msg, 'type'):
                    # Skip system messages in returned list
                    if msg.type != "system":
                        # Extract plain content (handle JSON if present)
                        content = msg.content
                        if isinstance(content, str):
                            try:
                                parsed = json.loads(content)
                                if isinstance(parsed, dict) and "message" in parsed:
                                    content = parsed["message"]
                            except json.JSONDecodeError:
                                pass
                        
                        messages_list.append({
                            "type": msg.type,
                            "content": content
                        })
                elif isinstance(msg, dict):
                    messages_list.append(msg)
            
            return {
                "response": response,
                "thread_id": thread_id,
                "messages": messages_list,
                "profile_used": bool(user_profile)
            }
            
        except Exception as e:
            logger.error(f"Chat error: {e}", exc_info=True)
            # Fallback to direct LLM call with career focus
            return self._fallback_chat(user_id, message, thread_id)
        
    def _fallback_chat(self, user_id: str, message: str, thread_id: str) -> Dict[str, Any]:
        """Fallback chat without LangGraph - with career focus"""
        # Get existing messages
        existing_messages = self.get_user_messages(user_id)
        
        # Get user profile
        user_profile = self.get_user_profile(user_id)
        
        # Prepare system prompt
        system_prompt = self._get_system_prompt(user_profile)
        
        # Prepare messages for LLM
        messages_for_llm = [SystemMessage(content=system_prompt)]
        for msg in existing_messages:
            if msg["type"] == "human":
                messages_for_llm.append(HumanMessage(content=msg["content"]))
            elif msg["type"] == "ai":
                messages_for_llm.append(AIMessage(content=msg["content"]))
        
        # Add new message with context
        user_message_content = {
            "user_id": user_id,
            "message": message,
            "profile_available": bool(user_profile)
        }
        messages_for_llm.append(HumanMessage(content=json.dumps(user_message_content)))
        
        try:
            # Get response
            response = self.llm.invoke(messages_for_llm)
            
            # Add AI response (skip system message in saved messages)
            saved_messages = []
            for msg in existing_messages:
                saved_messages.append(msg)
            
            # Add new human message (simplified)
            saved_messages.append({"type": "human", "content": message})
            saved_messages.append({"type": "ai", "content": response.content})
            
            # Save checkpoint manually
            self._save_messages_directly(thread_id, saved_messages)
            
            return {
                "response": response.content,
                "thread_id": thread_id,
                "messages": saved_messages,
                "profile_used": bool(user_profile)
            }
            
        except Exception as e:
            logger.error(f"Fallback chat error: {e}")
            return {
                "response": "I apologize, but I'm having trouble processing your career-related question right now. Please try again.",
                "thread_id": thread_id,
                "messages": existing_messages,
                "profile_used": False
            }
    
    def _save_messages_directly(self, thread_id: str, messages: List[Dict[str, Any]]):
        """Save messages directly for fallback"""
        try:
            config = {
                "configurable": {
                    "thread_id": thread_id,
                    "checkpoint_ns": ""
                }
            }
            
            # Convert to BaseMessage format
            base_messages = []
            for msg in messages:
                if msg["type"] == "human":
                    base_messages.append(HumanMessage(content=msg["content"]))
                elif msg["type"] == "ai":
                    base_messages.append(AIMessage(content=msg["content"]))
            
            # Create checkpoint
            from langgraph.checkpoint.base import CheckpointMetadata
            checkpoint = {
                "id": f"{thread_id}_{len(messages)}",
                "ts": "0",
                "channel_values": {
                    "messages": base_messages
                }
            }
            
            metadata = CheckpointMetadata(
                source="fallback",
                step=len(messages),
                writes={"messages": base_messages},
                config=config
            )
            
            # Save checkpoint
            self.checkpointer.put(config, checkpoint, metadata, {})
            
        except Exception as e:
            logger.error(f"Save messages error: {e}")
    
    def get_user_messages(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all messages from a user's personal thread"""
        thread_id = self.get_user_thread_id(user_id)
        
        config = {
            "configurable": {
                "thread_id": thread_id,
                "checkpoint_ns": ""
            }
        }
        
        try:
            # Get checkpoint
            checkpoint = self.checkpointer.get(config)
            
            if checkpoint:
                messages = checkpoint.get("channel_values", {}).get("messages", [])
                
                # Convert to simple format
                messages_list = []
                for msg in messages:
                    if hasattr(msg, 'type'):
                        # Handle JSON content
                        content = msg.content
                        if isinstance(content, str):
                            try:
                                # Try to parse JSON
                                parsed = json.loads(content)
                                if isinstance(parsed, dict) and "message" in parsed:
                                    content = parsed["message"]
                            except json.JSONDecodeError:
                                # Not JSON, use as-is
                                pass
                        
                        messages_list.append({
                            "type": msg.type,
                            "content": content
                        })
                    elif isinstance(msg, dict):
                        messages_list.append(msg)
                
                return messages_list
                
        except Exception as e:
            logger.error(f"Get user messages error: {e}")
        
        return []
    
    def clear_user_chat(self, user_id: str) -> bool:
        """Clear user's chat history"""
        try:
            thread_id = self.get_user_thread_id(user_id)
            
            # Delete thread using DjangoSaver's method
            self.checkpointer.delete_thread(thread_id)
            
            # Also clear profile if exists
            if user_id in self.user_profiles:
                del self.user_profiles[user_id]
            
            logger.info(f"Cleared chat and profile for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Clear chat error: {e}")
            return False
    
    def set_initial_profile(self, user_id: str, name: str = None, age: int = None, 
                           education: str = None, current_role: str = None, 
                           skills: List[str] = None, experience: str = None,
                           career_goals: str = None) -> None:
        """Set initial user profile for personalized career counseling"""
        profile_data = {
            "name": name,
            "age": age,
            "education": education,
            "current_role": current_role,
            "skills": skills or [],
            "experience": experience,
            "career_goals": career_goals
        }
        
        # Remove None values
        profile_data = {k: v for k, v in profile_data.items() if v is not None}
        
        self.update_user_profile(user_id, profile_data)


# Initialize agent globally
user_chat_agent = UserChatAgent()
