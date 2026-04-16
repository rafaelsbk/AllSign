from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from .models import User, Client, Contract, Role, Company, Professional
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, ClientSerializer, ContractSerializer, EmployeeSerializer, RoleSerializer, CompanySerializer, ProfessionalSerializer
from .permissions import IsAdmin

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RoleListCreateView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdmin,)

class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdmin,)

class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdmin,)
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']

class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdmin,)

class CompanyListCreateView(generics.ListCreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [filters.SearchFilter]
    search_fields = ['legal_name', 'trading_name', 'cnpj']

class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = (permissions.IsAuthenticated,)

class ProfessionalListCreateView(generics.ListCreateAPIView):
    queryset = Professional.objects.all()
    serializer_class = ProfessionalSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'crea_number', 'email']

class ProfessionalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Professional.objects.all()
    serializer_class = ProfessionalSerializer
    permission_classes = (permissions.IsAuthenticated,)

class ClientListCreateView(generics.ListCreateAPIView):
    queryset = Client.objects.all() # Todos podem ver todos os clientes
    serializer_class = ClientSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'cpf']

    def perform_create(self, serializer):
        # O vendedor continua sendo a pessoa que cadastrou
        serializer.save(seller=self.request.user)

class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all() # Todos podem ver todos os clientes
    serializer_class = ClientSerializer
    permission_classes = (permissions.IsAuthenticated,)

class ContractListCreateView(generics.ListCreateAPIView):
    serializer_class = ContractSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        client_id = self.request.query_params.get('client_id')
        if not client_id:
            return Contract.objects.none()
        
        # Como todos podem ver todos os clientes, a busca de contrato também não precisa de filtro por usuário
        try:
            client = Client.objects.get(id=client_id)
            return Contract.objects.filter(client=client)
        except Client.DoesNotExist:
            return Contract.objects.none()

class ContractDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = (permissions.IsAuthenticated,)
