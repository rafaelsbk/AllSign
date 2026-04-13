from django.urls import path
from .views import (
    RegisterView, ProfileView, ClientListCreateView, 
    ClientDetailView, ContractListCreateView, ContractDetailView,
    GenerateContractPDFView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('profile/', ProfileView.as_view(), name='user-profile'),
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
    path('contracts/', ContractListCreateView.as_view(), name='contract-list-create'),
    path('contracts/<int:pk>/', ContractDetailView.as_view(), name='contract-detail'),
    path('contracts/generate-pdf/', GenerateContractPDFView.as_view(), name='contract-generate-pdf'),
]
