from rest_framework import viewsets, permissions
from .models import Case, Document, Task, Billing, Meeting, Message, Hearing
from .serializers import (CaseSerializer, DocumentSerializer, TaskSerializer,
                          BillingSerializer, MeetingSerializer, MessageSerializer, HearingSerializer)

class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): 
        if self.request.user.is_lawyer: return Case.objects.filter(lawyer=self.request.user)
        return Case.objects.filter(client=self.request.user)
    def perform_create(self, serializer): serializer.save(lawyer=self.request.user)

class HearingViewSet(viewsets.ModelViewSet):
    serializer_class = HearingSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        if self.request.user.is_lawyer: return Hearing.objects.filter(case__lawyer=self.request.user)
        return Hearing.objects.filter(case__client=self.request.user)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): 
        case_id = self.request.query_params.get("case")
        if case_id: return Document.objects.filter(case_id=case_id)
        if self.request.user.is_lawyer: return Document.objects.filter(case__lawyer=self.request.user)
        return Document.objects.filter(case__client=self.request.user)
    def perform_create(self, serializer): serializer.save(uploaded_by=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): 
        case_id = self.request.query_params.get("case")
        if case_id: return Task.objects.filter(case_id=case_id)
        if self.request.user.is_lawyer: return Task.objects.filter(case__lawyer=self.request.user)
        return Task.objects.filter(case__client=self.request.user)

class BillingViewSet(viewsets.ModelViewSet):
    serializer_class = BillingSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        if self.request.user.is_lawyer: return Billing.objects.filter(case__lawyer=self.request.user)
        return Billing.objects.filter(case__client=self.request.user)

class MeetingViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        if self.request.user.is_lawyer: return Meeting.objects.filter(case__lawyer=self.request.user)
        return Meeting.objects.filter(case__client=self.request.user)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        case_id = self.request.query_params.get("case")
        if case_id: return Message.objects.filter(case_id=case_id)
        if self.request.user.is_lawyer: return Message.objects.filter(case__lawyer=self.request.user)
        return Message.objects.filter(case__client=self.request.user)
    def perform_create(self, serializer): serializer.save(sender=self.request.user)
