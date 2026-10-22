from rest_framework import serializers
from .models import Case, Document, Task, Billing, Meeting, Message, Hearing
from core.serializers import UserSerializer

class DocumentSerializer(serializers.ModelSerializer):
    class Meta: model = Document; fields = "__all__"

class TaskSerializer(serializers.ModelSerializer):
    class Meta: model = Task; fields = "__all__"

class BillingSerializer(serializers.ModelSerializer):
    class Meta: model = Billing; fields = "__all__"

class MeetingSerializer(serializers.ModelSerializer):
    class Meta: model = Meeting; fields = "__all__"

class HearingSerializer(serializers.ModelSerializer):
    class Meta: model = Hearing; fields = "__all__"

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')
    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ['sender']

class CaseSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)
    bills = BillingSerializer(many=True, read_only=True)
    meetings = MeetingSerializer(many=True, read_only=True)
    hearings = HearingSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    lawyer_detail = UserSerializer(source="lawyer", read_only=True)
    client_detail = UserSerializer(source="client", read_only=True)
    class Meta: model = Case; fields = "__all__"
