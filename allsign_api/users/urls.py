from django.urls import path
from .views import (
    MyTokenObtainPairView, 
    ClientListCreateView, 
    ClientDetailView,
    ContractListCreateView,
    ContractDetailView,
    RoleListCreateView,
    RoleDetailView,
    EmployeeListCreateView,
    EmployeeDetailView,
    CompanyListCreateView,
    CompanyDetailView,
    ProfessionalListCreateView,
    ProfessionalDetailView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),

    path('contracts/', ContractListCreateView.as_view(), name='contract-list-create'),
    path('contracts/<int:pk>/', ContractDetailView.as_view(), name='contract-detail'),

    path('roles/', RoleListCreateView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', RoleDetailView.as_view(), name='role-detail'),

    path('employees/', EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('employees/<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),

    path('companies/', CompanyListCreateView.as_view(), name='company-list-create'),
    path('companies/<int:pk>/', CompanyDetailView.as_view(), name='company-detail'),

    path('professionals/', ProfessionalListCreateView.as_view(), name='professional-list-create'),
    path('professionals/<int:pk>/', ProfessionalDetailView.as_view(), name='professional-detail'),
]
