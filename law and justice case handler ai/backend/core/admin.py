from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, LawyerProfile, ClientProfile

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_lawyer', 'is_client', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Roles', {'fields': ('is_lawyer', 'is_client', 'phone_number')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(LawyerProfile)
admin.site.register(ClientProfile)
