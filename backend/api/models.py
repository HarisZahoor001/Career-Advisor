from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Basic info=
    full_name = models.CharField(max_length=255)
    age = models.IntegerField(null=True, blank=True)
    # Academic info
    education_level = models.CharField(max_length=100, null=True, blank=True)
    field_of_study = models.CharField(max_length=100, null=True, blank=True)
    cgpa = models.FloatField(null=True, blank=True)

    # Skills & Interests
    skills = models.TextField(help_text="Comma-separated skills", blank=True)
    interests = models.TextField(help_text="Comma-separated interests", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


