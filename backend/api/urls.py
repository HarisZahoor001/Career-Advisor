from django.urls import path
from api.views import *

urlpatterns = [
    path('users/create/',view=CreateUserProfile.as_view(),name="user_create"),
    path('users/update/',view=UpdateUserProfile.as_view(),name="user_update"),
    path('users/retrieve/',view=RetrieveUserProfile.as_view(),name="user_retrieve"),
    path('users/delete/',view=DeleteUserProfile.as_view(),name="user_delete"),
    path('users/',view=ListAllUsers.as_view(),name="users"),
]
