import random
import string
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# In-memory token storage - moved outside the class
password_reset_tokens = {}

class PasswordResetManager:
    
    # Class variable to store tokens
    _password_reset_tokens = password_reset_tokens
    
    @staticmethod
    def generate_reset_token():
        """Generate a 6-digit numeric token"""
        return ''.join(random.choices(string.digits, k=6))
    
    @staticmethod
    def store_token(email, token, user_id, expires_in_hours=1):
        """Store reset token with expiration"""
        expires_at = datetime.now() + timedelta(hours=expires_in_hours)
        PasswordResetManager._password_reset_tokens[email] = {
            'token': token,
            'expires_at': expires_at.isoformat(),
            'user_id': user_id,
            'attempts': 0  # Track verification attempts
        }
        logger.info(f"Token stored for {email}")
        return True
    
    @staticmethod
    def validate_token(email, token):
        """Validate if token is correct and not expired"""
        if email not in PasswordResetManager._password_reset_tokens:
            logger.warning(f"No token found for {email}")
            return False, None
        
        token_data = PasswordResetManager._password_reset_tokens[email]
        
        # Check expiration
        expires_at = datetime.fromisoformat(token_data['expires_at'])
        if datetime.now() > expires_at:
            # Remove expired token
            del PasswordResetManager._password_reset_tokens[email]
            logger.warning(f"Token expired for {email}")
            return False, None
        
        # Check if token matches
        if token_data['token'] != token:
            token_data['attempts'] += 1
            
            # Limit attempts to 3
            if token_data['attempts'] >= 3:
                del PasswordResetManager._password_reset_tokens[email]
                logger.warning(f"Too many failed attempts for {email}")
                return False, None
            
            logger.warning(f"Invalid token attempt for {email}")
            return False, None
        
        # Token is valid
        return True, token_data['user_id']
    
    @staticmethod
    def remove_token(email):
        """Remove token after successful reset"""
        if email in PasswordResetManager._password_reset_tokens:
            del PasswordResetManager._password_reset_tokens[email]
            logger.info(f"Token removed for {email}")
    
    @staticmethod
    def send_reset_email(email, token, user):
        """Send password reset email"""
        try:
            subject = "Password Reset Request - Career Advisor"
            
            # Create HTML email
            html_message = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 30px; background-color: #f9f9f9; }}
                    .code {{ 
                        font-size: 24px; 
                        font-weight: bold; 
                        color: #4CAF50; 
                        text-align: center; 
                        margin: 20px 0;
                        padding: 10px;
                        background: white;
                        border: 2px dashed #4CAF50;
                        border-radius: 5px;
                    }}
                    .footer {{ 
                        text-align: center; 
                        margin-top: 30px; 
                        padding-top: 20px; 
                        border-top: 1px solid #ddd; 
                        color: #777; 
                        font-size: 12px; 
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hello {user.username},</p>
                        
                        <p>You're receiving this email because you requested a password reset for your Career Advisor account.</p>
                        
                        <p>Your password reset code is:</p>
                        
                        <div class="code">{token}</div>
                        
                        <p>This code will expire in 1 hour.</p>
                        
                        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                    </div>
                    
                    <div class="footer">
                        <p>© {datetime.now().year} Career Advisor. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Send email
            send_mail(
                subject=subject,
                message=f'Your password reset code is: {token}',
                from_email=settings.DEFAULT_FROM_EMAIL or 'noreply@careeradvisor.com',
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"Reset email sent to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send reset email to {email}: {str(e)}")
            return False
    
    # Simple class method to get tokens
    @classmethod
    def get_tokens(cls):
        return cls._password_reset_tokens
    
    # Class property (optional - use get_tokens() instead)
    @classmethod
    @property
    def tokens(cls):
        return cls._password_reset_tokens