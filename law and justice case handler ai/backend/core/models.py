from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    groups = models.ManyToManyField("auth.Group", related_name="custom_user_groups", blank=True)
    user_permissions = models.ManyToManyField("auth.Permission", related_name="custom_user_permissions", blank=True)
    is_lawyer = models.BooleanField(default=False)
    is_client = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.username

class LawyerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="lawyer_profile")
    bar_number = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=100)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"Lawyer: {self.user.username}"

class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="client_profile")
    address = models.TextField(blank=True)
    company_name = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Client: {self.user.username}"
