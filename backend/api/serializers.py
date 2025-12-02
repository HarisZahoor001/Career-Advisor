from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile


class UserProfileSerializer(serializers.Serializer):
    # User fields
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    # UserProfile fields
    full_name = serializers.CharField()
    age = serializers.IntegerField(required=False, allow_null=True)
    education_level = serializers.CharField(required=False, allow_blank=True)
    field_of_study = serializers.CharField(required=False, allow_blank=True)
    skills = serializers.CharField(required=False, allow_blank=True)
    interests = serializers.CharField(required=False, allow_blank=True)
    cgpa = serializers.FloatField(required=False, allow_null=True)  # Added missing field

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def create(self, validated_data):
        # Extract user fields
        username = validated_data.pop("username")
        email = validated_data.pop("email")
        password = validated_data.pop("password")

        # Create Django user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Create UserProfile
        profile = UserProfile.objects.create(
            user=user,
            full_name=validated_data.get("full_name", ""),
            age=validated_data.get("age"),
            education_level=validated_data.get("education_level", ""),
            field_of_study=validated_data.get("field_of_study", ""),
            cgpa=validated_data.get("cgpa"),  # Added
            skills=validated_data.get("skills", ""),
            interests=validated_data.get("interests", "")
        )

        # Return the created UserProfile instance for response
        return {
            "id": profile.id,
            "username": user.username,
            "email": user.email,
            "full_name": profile.full_name,
            "age": profile.age,
            "education_level": profile.education_level,
            "field_of_study": profile.field_of_study,
            "cgpa": profile.cgpa,
            "skills": profile.skills,
            "interests": profile.interests,
            "created_at": profile.created_at
        }

    def update(self, instance, validated_data):
        # Handle update if needed
        pass

    def to_representation(self, instance):
        # This controls what data is returned when serializing
        if isinstance(instance, dict):
            # If create() returns a dict
            return instance
        # If returning a model instance
        return {
            "id": instance.id if hasattr(instance, 'id') else None,
            "username": instance.user.username if hasattr(instance, 'user') else instance.get('username'),
            "email": instance.user.email if hasattr(instance, 'user') else instance.get('email'),
            "full_name": instance.full_name,
            "age": instance.age,
            "education_level": instance.education_level,
            "field_of_study": instance.field_of_study,
            "cgpa": instance.cgpa,
            "skills": instance.skills,
            "interests": instance.interests,
            "created_at": instance.created_at if hasattr(instance, 'created_at') else None
        }