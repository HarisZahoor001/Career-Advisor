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

    queryset=UserProfile.objects.all()
    serializer_class =UserProfileSerializer
    permission_classes=[AllowAny]