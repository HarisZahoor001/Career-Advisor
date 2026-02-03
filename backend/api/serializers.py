from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, Careers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import random
import string

class UserProfileSerializer(serializers.ModelSerializer):
    # Fields from the User model
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "email",
            "password",
            "full_name",
            "age",
            "education_level",
            "field_of_study",
            "cgpa",
            "skills",
            "interests",
            "created_at"
        ]
        read_only_fields = ["id", "created_at"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def create(self, validated_data):
        username = validated_data.pop("username")
        email = validated_data.pop("email")
        password = validated_data.pop("password")

        # Create User
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Create UserProfile
        profile = UserProfile.objects.create(user=user, **validated_data)
        return profile

    def to_representation(self, instance):
        """
        Customize output representation, combining User and UserProfile data.
        """
        return {
            "id": instance.id,
            "username": instance.user.username,
            "email": instance.user.email,
            "full_name": instance.full_name,
            "age": instance.age,
            "education_level": instance.education_level,
            "field_of_study": instance.field_of_study,
            "cgpa": instance.cgpa,
            "skills": instance.skills,
            "interests": instance.interests,
            "created_at": instance.created_at
        }
    
    def update(self, instance, validated_data):
        user = instance.user

        # Update user fields
        if 'username' in validated_data:
            user.username = validated_data.pop('username')
        if 'email' in validated_data:
            user.email = validated_data.pop('email')
        if 'password' in validated_data:
            user.set_password(validated_data.pop('password'))
        user.save()

        # Update UserProfile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class CareersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Careers
        fields = [
            "id",
            "name",
            "field",
            "description",
            "created_at"
        ]
        read_only_fields = ["id", "created_at"]
        
    def validate_name(self, value):
        """
        Validate that career name is unique
        """
        if Careers.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("Career with this name already exists")
        return value
        
    def to_representation(self, instance):
        """
        Custom representation if needed
        """
        return {
            "id": instance.id,
            "name": instance.name,
            "field": instance.field,
            "description": instance.description,
            "created_at": instance.created_at
        }


# Add these new password-related serializers at the end
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        return value

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True, max_length=6)
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })
        return attrs

class VerifyTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(required=True, max_length=6)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })
        return attrs


# Chat-related serializers
class ChatMessageSerializer(serializers.Serializer):
    """Serializer for chat messages"""
    message = serializers.CharField(
        required=True, 
        max_length=2000,
        trim_whitespace=True
    )
    
    def validate_message(self, value):
        """Validate message is not empty"""
        if not value or value.isspace():
            raise serializers.ValidationError("Message cannot be empty")
        return value


class ClearChatSerializer(serializers.Serializer):
    """Serializer for clearing chat"""
    confirm = serializers.BooleanField(
        required=True,
        help_text="Must be true to confirm clearing chat history"
    )
    
    def validate_confirm(self, value):
        """Validate confirmation"""
        if not value:
            raise serializers.ValidationError("You must confirm to clear chat history")
        return value


# Optional: Serializer for chat messages response
class ChatMessageResponseSerializer(serializers.Serializer):
    """Serializer for chat message response"""
    type = serializers.CharField()
    content = serializers.CharField()


class ChatResponseSerializer(serializers.Serializer):
    """Serializer for full chat response"""
    response = serializers.CharField()
    thread_id = serializers.CharField()
    messages = ChatMessageResponseSerializer(many=True)
    message_count = serializers.IntegerField()