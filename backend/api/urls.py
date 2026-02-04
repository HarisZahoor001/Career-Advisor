from django.urls import path
from api.views import (
    CreateUserProfile,
    RetrieveUserProfile,
    UpdateUserProfile,
    DeleteUserProfile,
    ListAllUsers,
    ListCareers,
    ForgotPasswordView,
    VerifyResetTokenView,
    ResetPasswordView,
    ChangePasswordView,
    LogoutView,
    ConversationView,
    ThreadMessagesView,
    ClearUserChatView,
    chat,
    jobs,
)
from api.views import check_patch_status

urlpatterns = [
    # CREATE USER (Signup)
    path('users/', CreateUserProfile.as_view(), name="user_create"),

    # LIST ALL USERS
    path('users/all/', ListAllUsers.as_view(), name="users"),

    # LOGGED-IN USER ACTIONS
    path('users/me/', RetrieveUserProfile.as_view(), name="user_retrieve"),
    path('users/me/update/', UpdateUserProfile.as_view(), name="user_update"),
    path('users/me/delete/', DeleteUserProfile.as_view(), name="user_delete"),

    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('auth/verify-reset-token/', VerifyResetTokenView.as_view(), name='verify_reset_token'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),

     path('api/chat/', ConversationView.as_view(), name='chat'),
    path('api/messages/', ThreadMessagesView.as_view(), name='thread_messages'),
    path('api/clear-chat/', ClearUserChatView.as_view(), name='clear_chat'),

    # URL FOR CAREER
    path('careers/', ListCareers.as_view(), name="list_career"),

    # Chat API
    path('chat/', chat, name="chat"),
    # Jobs API
    path('jobs/', jobs, name="jobs"),

   


   
    path('api/patch-status/', check_patch_status, name='patch-status'),



]
