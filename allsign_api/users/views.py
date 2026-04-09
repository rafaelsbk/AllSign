from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from .models import User, Client
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, UserSerializer, ClientSerializer
from .permissions import IsAdminRole
from django_filters.rest_framework import DjangoFilterBackend

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
