import logging
import os
import requests
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import UserProfile, Careers
from .serializers import UserProfileSerializer, CareersSerializer

logger = logging.getLogger(__name__)

# Create your views here.

class CreateUserProfile(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]

class RetrieveUserProfile(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return UserProfile.objects.get(user=self.request.user)
    
class UpdateUserProfile(generics.UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Return the UserProfile of the currently logged-in user
        return UserProfile.objects.get(user=self.request.user)
    
class DeleteUserProfile(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Only allow the logged-in user to delete their own profile
        return UserProfile.objects.get(user=self.request.user)
    
class ListAllUsers(generics.ListAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]


# Views for Careers
class ListCareers(generics.ListAPIView):
    queryset = Careers.objects.all()
    serializer_class = CareersSerializer
    permission_classes = [AllowAny]


# Chat API endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    """
    Handle chat requests and communicate with OpenAI API.
    API key is kept secure on the backend.
    """
    try:
        message = request.data.get('message', '').strip()
        career = request.data.get('career', None)
        
        if not message:
            return Response(
                {'error': 'Message cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if not openai_api_key:
            logger.error('OpenAI API key not configured')
            return Response(
                {'error': 'Chat service is not configured'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Call OpenAI API
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {openai_api_key}'
            },
            json={
                'model': 'gpt-3.5-turbo',
                'messages': [
                    {
                        'role': 'system',
                        'content': f'You are a helpful career advisor AI. The user is asking about {career or "a career"}. Provide detailed, structured information about this career path.'
                    },
                    {'role': 'user', 'content': message}
                ],
                'max_tokens': 500
            },
            timeout=30
        )
        
        if response.status_code != 200:
            logger.error(f'OpenAI API error: {response.status_code}')
            return Response(
                {'error': 'Failed to generate response'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        data = response.json()
        ai_response = data['choices'][0]['message']['content']
        
        logger.info(f'Chat request handled for user {request.user.username}')
        
        return Response({'response': ai_response})
    
    except requests.exceptions.Timeout:
        logger.error('OpenAI API request timeout')
        return Response(
            {'error': 'Request timeout'},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except Exception as e:
        logger.error(f'Chat error: {str(e)}')
        return Response(
            {'error': 'An error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Jobs API endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def jobs(request):
    """
    Handle job search requests and communicate with Adzuna API.
    API keys are kept secure on the backend.
    """
    try:
        query = request.query_params.get('query', 'software engineer')
        location = request.query_params.get('location', 'us')
        page = request.query_params.get('page', 1)
        results_per_page = request.query_params.get('results_per_page', 20)
        
        adzuna_app_id = os.getenv('ADZUNA_APP_ID')
        adzuna_api_key = os.getenv('ADZUNA_API_KEY')
        
        if not adzuna_app_id or not adzuna_api_key:
            logger.error('Adzuna API credentials not configured')
            return Response(
                {'error': 'Job search service is not configured'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Call Adzuna API
        response = requests.get(
            f'https://api.adzuna.com/v1/api/jobs/{location}/search/{page}',
            params={
                'app_id': adzuna_app_id,
                'app_key': adzuna_api_key,
                'results_per_page': results_per_page,
                'what': query,
                'content-type': 'application/json'
            },
            timeout=15
        )
        
        if response.status_code != 200:
            logger.warning(f'Adzuna API error: {response.status_code}')
            # Return mock data on API failure
            return Response({
                'results': get_mock_jobs(),
                'count': 1
            })
        
        data = response.json()
        
        logger.info(f'Job search performed for user {request.user.username}')
        
        return Response(data)
    
    except requests.exceptions.Timeout:
        logger.error('Adzuna API request timeout')
        return Response(
            {'results': get_mock_jobs(), 'count': 1}
        )
    except Exception as e:
        logger.error(f'Job search error: {str(e)}')
        return Response(
            {'results': get_mock_jobs(), 'count': 1}
        )


def get_mock_jobs():
    """Return mock job data when API is unavailable"""
    return [
        {
            'id': '1',
            'title': 'Senior Software Engineer',
            'company': {'display_name': 'Tech Corp Inc.'},
            'location': {'display_name': 'San Francisco, CA'},
            'description': 'Looking for a senior software engineer with 5+ years experience...',
            'salary_min': 120000,
            'salary_max': 180000,
            'created': '2024-01-01T00:00:00Z',
            'redirect_url': '#',
            'category': {'label': 'IT Jobs'}
        },
    ]




# _______________________________________________________________________________________________________

#Forget Password Functionality#
# _______________________________________________________________________________________________________




from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    ForgotPasswordSerializer, 
    ResetPasswordSerializer, 
    VerifyTokenSerializer,
    ChangePasswordSerializer
)
from .password_utils import PasswordResetManager
import logging

logger = logging.getLogger(__name__)

# Add these view classes to your existing views.py
class ForgotPasswordView(generics.GenericAPIView):
    """
    Send password reset email with verification code
    """
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                # Check if user exists with this email
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # For security, don't reveal if email exists
                logger.warning(f"Password reset requested for non-existent email: {email}")
                return Response({
                    'detail': 'If an account exists with this email, you will receive a reset code shortly.'
                }, status=status.HTTP_200_OK)
            
            # Generate reset token
            token = PasswordResetManager.generate_reset_token()
            
            # Store token
            PasswordResetManager.store_token(
                email=email,
                token=token,
                user_id=user.id,
                expires_in_hours=1
            )
            
            # Send reset email
            email_sent = PasswordResetManager.send_reset_email(email, token, user)
            
            if email_sent:
                logger.info(f"Password reset initiated for user: {user.username}")
                return Response({
                    'detail': 'Password reset code sent to your email.',
                    'email': email  # Return email for frontend to use in next step
                }, status=status.HTTP_200_OK)
            else:
                logger.error(f"Failed to send reset email for user: {user.username}")
                return Response({
                    'detail': 'Failed to send reset email. Please try again later.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyResetTokenView(generics.GenericAPIView):
    """
    Verify the reset token before allowing password reset
    """
    permission_classes = [AllowAny]
    serializer_class = VerifyTokenSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']
            
            # Validate token
            is_valid, user_id = PasswordResetManager.validate_token(email, token)
            
            if is_valid:
                logger.info(f"Reset token verified for email: {email}")
                return Response({
                    'detail': 'Token verified successfully.',
                    'email': email,
                    'token': token
                }, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Invalid reset token for email: {email}")
                return Response({
                    'detail': 'Invalid or expired reset code.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(generics.GenericAPIView):
    """
    Reset password using verified token
    """
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            # Find email by token - FIXED: Use get_tokens() method
            email = None
            tokens = PasswordResetManager.get_tokens()  # Changed to get_tokens()
            
            for stored_email, token_data in tokens.items():
                if token_data['token'] == token:
                    email = stored_email
                    break
            
            if not email:
                logger.warning(f"Password reset attempted with invalid token")
                return Response({
                    'detail': 'Invalid reset code.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate token again
            is_valid, user_id = PasswordResetManager.validate_token(email, token)
            
            if is_valid and user_id:
                try:
                    # Get user and reset password
                    user = User.objects.get(id=user_id)
                    user.set_password(new_password)
                    user.save()
                    
                    # Remove used token
                    PasswordResetManager.remove_token(email)
                    
                    # Invalidate existing tokens (optional)
                    RefreshToken.for_user(user)
                    
                    logger.info(f"Password reset successful for user: {user.username}")
                    
                    return Response({
                        'detail': 'Password reset successful. You can now login with your new password.'
                    }, status=status.HTTP_200_OK)
                    
                except User.DoesNotExist:
                    logger.error(f"User not found during password reset: {user_id}")
                    return Response({
                        'detail': 'User account not found.'
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                logger.warning(f"Invalid token during password reset for email: {email}")
                return Response({
                    'detail': 'Invalid or expired reset code.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(generics.GenericAPIView):
    """
    Change password for authenticated users
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            # Verify old password
            if not user.check_password(serializer.validated_data['old_password']):
                logger.warning(f"Wrong old password attempt for user: {user.username}")
                return Response({
                    'detail': 'Current password is incorrect.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Invalidate existing tokens (optional but recommended)
            try:
                RefreshToken.for_user(user)
            except:
                pass
            
            logger.info(f"Password changed successfully for user: {user.username}")
            
            return Response({
                'detail': 'Password changed successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(generics.GenericAPIView):
    """
    Logout user by blacklisting refresh token
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            logger.info(f"User logged out: {request.user.username}")
            
            return Response({
                'detail': 'Successfully logged out.'
            }, status=status.HTTP_205_RESET_CONTENT)
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({
                'detail': 'Error during logout.'
            }, status=status.HTTP_400_BAD_REQUEST)
        


# _______________________________________________________________________________________________________

#Ai Agent#
# _______________________________________________________________________________________________________




# views.py (alternative with class-based views)
import logging
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .agents import user_chat_agent
from .serializers import ChatMessageSerializer, ClearChatSerializer

logger = logging.getLogger(__name__)



# ConversationView - User-specific thread
class ConversationView(generics.GenericAPIView):
    """
    Send a message in user's personal conversation thread
    POST /api/conversation/
    {
        "message": "Hello, I need career advice"
    }
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChatMessageSerializer  # Add this line
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            message = serializer.validated_data['message']
            
            try:
                # Get response from user's personal chat
                result = user_chat_agent.chat(str(user.id), message)
                
                logger.info(f"Conversation - User: {user.username}, Thread: {result['thread_id']}")
                
                return Response({
                    'response': result['response'],
                    'thread_id': result['thread_id'],
                    'messages': result['messages'],
                    'message_count': len(result['messages'])
                })
                
            except Exception as e:
                logger.error(f"Conversation error: {str(e)}", exc_info=True)
                return Response(
                    {'error': 'Failed to process conversation'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ThreadMessagesView(generics.GenericAPIView):
    """
    Get all messages from user's personal thread
    GET /api/thread-messages/
    No parameters needed - uses authenticated user's ID
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        # Return None since this view doesn't need input serialization
        return None
    
    def get(self, request):
        try:
            user = request.user
            
            # Get messages from user's personal thread
            messages = user_chat_agent.get_user_messages(str(user.id))
            
            # Get user's thread ID
            thread_id = user_chat_agent.get_user_thread_id(str(user.id))
            
            return Response({
                'thread_id': thread_id,
                'user_id': user.id,
                'username': user.username,
                'messages': messages,
                'count': len(messages)
            })
            
        except Exception as e:
            logger.error(f"Get user messages error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to get user messages'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ClearUserChatView(generics.GenericAPIView):
    """Clear user's chat history"""
    permission_classes = [IsAuthenticated]
    serializer_class = ClearChatSerializer  # Add this line
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            print("Clear chat requested by user:", user.username)
            
            # Optional: Add confirmation check
            if not serializer.validated_data.get('confirm', True):
                return Response(
                    {'error': 'Confirmation required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Clear chat using agent
            success = user_chat_agent.clear_user_chat(str(user.id))
            
            if success:
                logger.info(f"Cleared chat for user: {user.username}")
                return Response({
                    'message': 'Chat history cleared successfully',
                    'user_id': user.id,
                    'username': user.username
                })
            else:
                return Response(
                    {'error': 'Failed to clear chat history'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)