from django.urls import path
from api.views import (
    CreateUserProfile,
    RetrieveUserProfile,
    UpdateUserProfile,
    DeleteUserProfile,
    ListAllUsers,
    ListCareers
)

urlpatterns = [
    # CREATE USER (Signup)
    path('users/', CreateUserProfile.as_view(), name="user_create"),

    # LIST ALL USERS
    path('users/all/', ListAllUsers.as_view(), name="users"),

    # LOGGED-IN USER ACTIONS
    path('users/me/', RetrieveUserProfile.as_view(), name="user_retrieve"),
    path('users/me/update/', UpdateUserProfile.as_view(), name="user_update"),
    path('users/me/delete/', DeleteUserProfile.as_view(), name="user_delete"),

    # URL FOR CAREER
    path('careers/', ListCareers.as_view(), name="list_career"),
]
