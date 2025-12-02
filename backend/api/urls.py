from django.urls import path
from api.views import *

urlpatterns = [
    path('users/',view=CreateUserProfile.as_view(),name="user-view-create"),
]
