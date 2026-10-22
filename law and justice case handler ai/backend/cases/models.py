from django.db import models
from django.conf import settings

class Case(models.Model):
    STATUS_CHOICES = [("OPEN", "Open"), ("PENDING", "Pending"), ("CLOSED", "Closed")]
    STAGE_CHOICES = [
        ("INTAKE", "Initial Intake"),
        ("PLEADING", "Pleading Phase"),
        ("DISCOVERY", "Discovery"),
        ("TRIAL", "Trial Phase"),
        ("APPEAL", "Appeal"),
        ("RESOLVED", "Resolved")
    ]
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="OPEN")
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default="INTAKE")
    lawyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cases_handled")
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cases_owned")
    ai_summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self): return self.title

class Document(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="documents/")
    title = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self): return self.title

class Task(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)

    def __str__(self): return self.title

class Billing(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="bills")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)
    description = models.TextField(blank=True)

class Meeting(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="meetings")
    title = models.CharField(max_length=255)
    date = models.DateTimeField()
    link = models.URLField(blank=True)
    description = models.TextField(blank=True)

class Hearing(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="hearings")
    title = models.CharField(max_length=255)
    date = models.DateTimeField()
    judge = models.CharField(max_length=255)
    hearing_type = models.CharField(max_length=100) # e.g., Preliminary, Trial, Motion
    courtroom = models.CharField(max_length=50, blank=True)

class Message(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_ai = models.BooleanField(default=False)
