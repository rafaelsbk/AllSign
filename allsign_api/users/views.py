from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from .models import User, Client, Contract, ContractTemplate, Company, Professional, LetterheadTemplate
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    MyTokenObtainPairSerializer, UserSerializer, ClientSerializer, 
    ContractSerializer, ContractTemplateSerializer,
    CompanySerializer, ProfessionalSerializer, LetterheadTemplateSerializer
)
from .permissions import IsAdmin
from django_filters.rest_framework import DjangoFilterBackend
from .utils import render_to_pdf, save_contract_pdf
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

            # Criar a nova estrutura unificada (Word-like)
            # Vamos converter os parágrafos em HTML simples para o novo editor
            paragraphs = [p.strip() for p in content_text.split('\n\n') if p.strip()]
            html_paragraphs = ""
            for p in paragraphs:
                # Se for curto e maiúsculo, tratamos como título/cláusula
                if (len(p) < 100) and (p.isupper() or p.lower().startswith('cláusula')):
                    html_paragraphs += f"<h2>{p}</h2>"
                else:
                    html_paragraphs += f"<p>{p}</p>"

            # Montar o payload no novo formato unificado
            template_data = {
                "name": f"Modelo: {file.name}",
                "category": "Importado",
                "content": {
                    "document_title": file.name,
                    "html_content": html_paragraphs
                }
            }
            
            serializer = ContractTemplateSerializer(data=template_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": f"Erro interno ao processar arquivo: {str(e)}"}, status=500)

import re

class GenerateContractPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            html_content = data.get('html_content', '')

            # Limpeza rigorosa para o xhtml2pdf
            # 1. Remove spacers do Lexical (que causam grandes buracos no PDF)
            html_content = re.sub(r'<div[^>]*class="lexical-spacer"[^>]*>.*?</div>', '', html_content, flags=re.DOTALL)
            
            # 2. Remove larguras fixas (px) que fazem a tabela ou texto passar das margens
            html_content = re.sub(r'width:\s*\d+px;?', '', html_content)
            html_content = re.sub(r'width="\d+"', '', html_content)
            
            # 3. Remove classes de preview que podem interferir no estilo final
            html_content = html_content.replace('text-blue-600 font-bold border-b border-blue-200', '')
            
            # 4. Garante que as tabelas tenham largura total e bordas simples
            html_content = html_content.replace('<table', '<table width="100%" border="1" cellspacing="0" cellpadding="4"')
            
            data['html_content'] = html_content

            # Busca o papel timbrado (por ID ou o primeiro ativo)
            letterhead_id = data.get('letterhead_id')
            letterhead = None
            if letterhead_id:
                letterhead = LetterheadTemplate.objects.filter(id=letterhead_id).first()
            else:
                letterhead = LetterheadTemplate.objects.filter(is_active=True).first()

            if letterhead:
                # xhtml2pdf precisa do caminho absoluto no sistema de arquivos
                if letterhead.header_image:
                    data['header_image_path'] = letterhead.header_image.path
                if letterhead.footer_image:
                    data['footer_image_path'] = letterhead.footer_image.path
                
                # Margens dinâmicas (percentual)
                data['header_margin_percent'] = letterhead.header_margin_percent
                data['footer_margin_percent'] = letterhead.footer_margin_percent

            # Se o payload contiver 'sections', usamos o novo motor dinâmico
            if 'sections' in data:
                pdf = render_to_pdf('users/contrato_dinamico_pdf.html', data)
            else:
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
            return [IsAdmin()]
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

    def perform_create(self, serializer):
        contract = serializer.save()
        
        # Se houver HTML final no extra_data, gera o PDF
        html_content = contract.extra_data.get('final_html')
        if html_content:
            try:
                letterhead_id = contract.extra_data.get('letterhead_id')
                letterhead = None
                if letterhead_id and str(letterhead_id).isdigit():
                    letterhead = LetterheadTemplate.objects.filter(id=letterhead_id).first()
                
                save_contract_pdf(contract, html_content, letterhead)
                contract.save()
            except Exception as e:
                print(f"Erro ao gerar PDF no perform_create: {str(e)}")

class ContractDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_update(self, serializer):
        contract = serializer.save()
        
        # Atualiza o PDF se o HTML final mudar ou for enviado
        html_content = contract.extra_data.get('final_html')
        if html_content:
            try:
                letterhead_id = contract.extra_data.get('letterhead_id')
                letterhead = None
                if letterhead_id and str(letterhead_id).isdigit():
                    letterhead = LetterheadTemplate.objects.filter(id=letterhead_id).first()
                
                save_contract_pdf(contract, html_content, letterhead)
                contract.save()
            except Exception as e:
                print(f"Erro ao gerar PDF no perform_update: {str(e)}")

class ContractTemplateListView(generics.ListCreateAPIView):
    queryset = ContractTemplate.objects.filter(is_active=True).order_by('name')
    serializer_class = ContractTemplateSerializer
    permission_classes = (permissions.IsAuthenticated,)

class ContractTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ContractTemplate.objects.all()
    serializer_class = ContractTemplateSerializer
    permission_classes = (permissions.IsAuthenticated,)

class CompanyListCreateView(generics.ListCreateAPIView):
    queryset = Company.objects.all().order_by('trading_name')
    serializer_class = CompanySerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['legal_name', 'trading_name', 'cnpj']

class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = (permissions.IsAuthenticated,)

class ProfessionalListCreateView(generics.ListCreateAPIView):
    queryset = Professional.objects.all().order_by('name')
    serializer_class = ProfessionalSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'crea_number']

class ProfessionalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Professional.objects.all()
    serializer_class = ProfessionalSerializer
    permission_classes = (permissions.IsAuthenticated,)

class LetterheadTemplateListView(generics.ListCreateAPIView):
    queryset = LetterheadTemplate.objects.all().order_by('name')
    serializer_class = LetterheadTemplateSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']

class LetterheadTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LetterheadTemplate.objects.all()
    serializer_class = LetterheadTemplateSerializer
    permission_classes = (permissions.IsAuthenticated,)
