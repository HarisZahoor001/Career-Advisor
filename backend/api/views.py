from django.shortcuts import render
from rest_framework import generics
from .models import UserProfile
from .serializers import UserProfileSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated

# Create your views here.

class CreateUserProfile(generics.CreateAPIView):
    queryset=UserProfile.objects.all()
    serializer_class =UserProfileSerializer
    permission_classes=[AllowAny]
