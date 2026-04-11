from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from .models import User, Client, Contract
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, UserSerializer, ClientSerializer, ContractSerializer
from .permissions import IsAdminRole
from django_filters.rest_framework import DjangoFilterBackend
from .utils import render_to_pdf
from django.http import HttpResponse
from rest_framework.views import APIView

class GenerateContractPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            pdf = render_to_pdf('users/contrato_pdf.html', data)
            if pdf:
                response = HttpResponse(pdf.content, content_type='application/pdf')
                filename = f"Contrato_{data.get('client_name', 'Documento').replace(' ', '_')}.pdf"
                content = f"attachment; filename={filename}"
                response['Content-Disposition'] = content
                # Permitir que o frontend leia o cabeçalho Content-Disposition se necessário
                response['Access-Control-Expose-Headers'] = 'Content-Disposition'
                return response
            return HttpResponse("Erro ao gerar PDF", status=400)
        except Exception as e:
            return HttpResponse(str(e), status=500)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)

class ProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class ClientListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'cpf']
    ordering_fields = ['name']
    ordering = ['name']

    def get_queryset(self):
        queryset = Client.objects.all().order_by('name')
        
        # Filtro: cadastrados por mim
        only_mine = self.request.query_params.get('only_mine', 'false').lower() == 'true'
        if only_mine:
            queryset = queryset.filter(seller=self.request.user)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

class ContractListCreateView(generics.ListCreateAPIView):
    serializer_class = ContractSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['client__name']
    ordering_fields = ['created_at', 'contract_date']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Contract.objects.all().order_by('-created_at')
        client_id = self.request.query_params.get('client_id')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        return queryset

class ContractDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = (permissions.IsAuthenticated,)
