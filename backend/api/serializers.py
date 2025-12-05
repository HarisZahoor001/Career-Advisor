from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile


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