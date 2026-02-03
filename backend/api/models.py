from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Basic info
    full_name = models.CharField(max_length=255)
    age = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(13), MaxValueValidator(120)]
    )
    # Academic info
    education_level = models.CharField(max_length=100, null=True, blank=True)
    field_of_study = models.CharField(max_length=100, null=True, blank=True)
    cgpa = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        help_text="CGPA should be between 0 and 10"
    )

    # Skills & Interests
    skills = models.TextField(help_text="Comma-separated skills", blank=True)
    interests = models.TextField(help_text="Comma-separated interests", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return self.full_name


class Careers(models.Model):

    name = models.CharField(max_length=255, unique=True, db_index=True)
    field = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Careers"
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['field']),
        ]

    def __str__(self):
        return self.name