from rest_framework import generics, permissions
from .models import User
from .serializers import UserSerializer
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all(); permission_classes = (permissions.AllowAny,); serializer_class = UserSerializer
class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer; permission_classes = (permissions.IsAuthenticated,)
    def get_object(self): return self.request.user

class ClientListView(generics.ListAPIView):
    serializer_class = UserSerializer; permission_classes = (permissions.IsAuthenticated,)
    def get_queryset(self): return User.objects.filter(is_client=True)

class LawyerListView(generics.ListAPIView):
    serializer_class = UserSerializer; permission_classes = (permissions.IsAuthenticated,)
    def get_queryset(self): return User.objects.filter(is_lawyer=True)
