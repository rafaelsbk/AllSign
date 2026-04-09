from django.urls import path
from .views import RegisterView, ProfileView, ClientListCreateView, ClientDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('profile/', ProfileView.as_view(), name='user-profile'),
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
]
