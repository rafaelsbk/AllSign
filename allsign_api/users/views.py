from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from .models import User, Client, Contract, ContractTemplate
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, UserSerializer, ClientSerializer, ContractSerializer, ContractTemplateSerializer
from .permissions import IsAdminRole
from django_filters.rest_framework import DjangoFilterBackend
from .utils import render_to_pdf
from django.http import HttpResponse
from rest_framework.views import APIView
import docx
from pypdf import PdfReader
import io

class ContractTemplateUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "Nenhum arquivo enviado"}, status=status.HTTP_400_BAD_REQUEST)

        filename = file.name.lower()
        content_text = ""

        try:
            if filename.endswith('.docx'):
                doc = docx.Document(file)
                # Extrai texto preservando parágrafos
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                content_text = "\n\n".join(paragraphs)
            elif filename.endswith('.pdf'):
                reader = PdfReader(file)
                pages_text = []
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        pages_text.append(text)
                content_text = "\n\n".join(pages_text)
            elif filename.endswith('.doc'):
                return Response({"error": "Arquivos .doc antigos não são suportados. Por favor, converta para .docx antes de enviar."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "Formato de arquivo não suportado. Use .docx ou .pdf"}, status=status.HTTP_400_BAD_REQUEST)

            if not content_text:
                return Response({"error": "Não foi possível extrair texto do arquivo."}, status=status.HTTP_400_BAD_REQUEST)

            # Criar a estrutura de seções e blocos
            # Vamos separar por parágrafos duplos (conforme extraído)
            paragraphs = [p.strip() for p in content_text.split('\n\n') if p.strip()]
            
            blocks = []
            for p in paragraphs:
                # Heurística simples para detectar títulos/cláusulas
                # Se for curto (menos de 80 chars) e estiver em maiúsculo ou começar com Cláusula
                is_clause_title = (len(p) < 100) and (p.isupper() or p.lower().startswith('cláusula') or p.lower().startswith('clausula'))
                
                blocks.append({
                    "type": "text_highlight" if is_clause_title else "text",
                    "content": p
                })

            section = {
                "id": "sec_imported_1",
                "title": "Conteúdo Importado do Arquivo",
                "mb": True,
                "underline": False,
                "page_break_before": False,
                "blocks": blocks
            }

            # Montar o payload final para o template
            template_data = {
                "name": f"Modelo: {file.name}",
                "category": "Importado",
                "content": {"sections": [section]}
            }
            
            serializer = ContractTemplateSerializer(data=template_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": f"Erro interno ao processar arquivo: {str(e)}"}, status=500)

class GenerateContractPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            # Se o payload contiver 'sections', usamos o novo motor dinâmico
            if 'sections' in data:
                pdf = render_to_pdf('users/contrato_dinamico_pdf.html', data)
            else:
                # Fallback para o contrato antigo hardcoded (compatibilidade)
                pdf = render_to_pdf('users/contrato_pdf.html', data)
                
            if pdf:
                response = HttpResponse(pdf.content, content_type='application/pdf')
                filename = f"Contrato_{data.get('client_name', 'Documento').replace(' ', '_')}.pdf"
                content = f"attachment; filename={filename}"
                response['Content-Disposition'] = content
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

class ContractTemplateListView(generics.ListCreateAPIView):
    queryset = ContractTemplate.objects.filter(is_active=True).order_by('name')
    serializer_class = ContractTemplateSerializer
    permission_classes = (permissions.IsAuthenticated,)

class ContractTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ContractTemplate.objects.all()
    serializer_class = ContractTemplateSerializer
    permission_classes = (permissions.IsAuthenticated,)
