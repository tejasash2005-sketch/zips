from django.contrib import admin
from .models import Case, Document, Task, Billing, Meeting, Message

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('title', 'lawyer', 'client', 'status', 'created_at')
    list_filter = ('status', 'lawyer')
    search_fields = ('title', 'description')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'case', 'uploaded_by', 'uploaded_at')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'case', 'due_date', 'is_completed')
    list_filter = ('is_completed',)

@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    list_display = ('case', 'amount', 'due_date', 'is_paid')
    list_filter = ('is_paid',)

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('title', 'case', 'date')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'case', 'timestamp')
