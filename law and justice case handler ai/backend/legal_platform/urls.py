from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.views import RegisterView, UserDetailView, ClientListView, LawyerListView
from cases.views import CaseViewSet, DocumentViewSet, TaskViewSet, BillingViewSet, MeetingViewSet, MessageViewSet, HearingViewSet

router = DefaultRouter()
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'billing', BillingViewSet, basename='billing')
router.register(r'meetings', MeetingViewSet, basename='meeting')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'hearings', HearingViewSet, basename='hearing')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', UserDetailView.as_view(), name='user_detail'),
    path('api/clients/', ClientListView.as_view(), name='client-list'),
    path('api/lawyers/', LawyerListView.as_view(), name='lawyer-list'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
