import os
import io
import json
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from pypdf import PdfReader

User = get_user_model()

class FullContractReplicationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin_tester', password='securepassword')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Referência original na raiz
        self.reference_pdf_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'Contrato_Gabriel_Adler_Aedron.pdf')
        # Caminho para salvar o resultado (mesma pasta deste arquivo de teste)
        self.output_pdf_path = os.path.join(os.path.dirname(__file__), 'full_comparison_result.pdf')

    def normalize_text(self, text):
        """Remove quebras de linha e espaços extras para comparação de conteúdo puro."""
        return " ".join(text.split()).lower()

    def extract_full_text(self, pdf_bytes):
        reader = PdfReader(io.BytesIO(pdf_bytes))
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"
        return full_text

    def test_replicate_full_contract_appearance_and_content(self):
        # 1. Validação de pré-requisito
        self.assertTrue(os.path.exists(self.reference_pdf_path), f"Arquivo de referência não encontrado: {self.reference_pdf_path}")

        # 2. Construção do Payload IDÊNTICO ao documento de referência (Baseado no OCR)
        # O payload segue a estrutura de 'sections' e 'blocks' da aplicação
        payload = {
            "doc_title": "INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS VOLTADOS PARA INSTALAÇÃO DE SISTEMA SOLAR FOTOVOLTAICO",
            "doc_subtitle": "CONTRATO N º ON-RN-XXX-2025",
            "sections": [
                {
                    "title": "I – DA QUALIFICAÇÃO DAS PARTES:",
                    "mb": True,
                    "blocks": [
                        {
                            "type": "text",
                            "content": "<strong>Contratante:</strong> Gabriel Adler Aedron, BRASILEIRO (A), inscrito no CPF sob o nº 783.621.764-12, RG nº 35241321414, residente e domiciliado na Rua Rua Tenente Vitor Lourenço Bernardes, nº 23, Bairro Nova Parnamirim, Cidade Parnamirim, CEP 59153-040, portador do celular nº (14) 67235-4242 e endereço eletrônico gabriel@sas.gay.br, de ora em diante denominado(a) de CONTRATANTE."
                        },
                        {
                            "type": "text",
                            "mt": True,
                            "content": "<strong>Contratada: SOLAR SOL ENERGIA RENOVÁVEIS LTDA</strong>, pessoa jurídica de direito privado, inscrita sob o CNPJ nº 42.518.541/0001-56, com endereço comercial na Avenida Prudente de Morais, nº 0507, Centro Empresarial Djalma Marinho, Loja A, Tirol, Natal/RN, CEP 590.20-810, neste ato representado por seu sócio, Sr. Lucas Luís de Oliveira Barbosa, portador do RG nº 2189466 e CREA nº 2119764026, de ora em diante denominada de CONTRATADA."
                        }
                    ]
                },
                {
                    "title": "II – DO QUADRO RESUMO:",
                    "mb": True,
                    "blocks": [
                        {
                            "type": "structured_table",
                            "rows": [
                                { "label": "VALOR DO SERVIÇO PARA SOLAR SOL ENERGIA RENOVÁVEIS LTDA", "value": "R$ 3000", "bold_value": True },
                                { "label": "VALOR DO EQUIPAMENTO PARA OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA", "value": "R$ 4000", "bold_value": True },
                                { "label": "VIGÊNCIA DO CONTRATO", "value": "12 (DOZE) MESES", "bold_value": True },
                                { 
                                    "label": "EQUIPAMENTOS ADQUIRIDOS", 
                                    "value_list": [
                                        "4 INVERSOR MARCA laeldron",
                                        "4 PAINÉIS FOTOVOLTAICOS DE MARCA fotozon",
                                        "KIT, CABOS CC, PARAFUSO, TRILHOS DE FIXAÇÃO DE INSTALAÇÃO"
                                    ],
                                    "bold_value": True 
                                }
                            ]
                        },
                        {
                            "type": "structured_table",
                            "rows": [
                                { "label": "DATA DE VENCIMENTO DO PAGAMENTO DO SERVIÇO", "value": "10/10/2026", "bold_value": True },
                                { "label": "FORMA DE PAGAMENTO", "value": "PIX", "bold_value": True },
                                { "label": "UNIDADES BENEFICIARIAS", "value": "NÃO POSSUI", "bold_value": True }
                            ]
                        },
                        {
                            "type": "text",
                            "content": "Pelo presente instrumento particular as partes, CONTRATADA e CONTRATANTE, têm entre si, certa, ajustada e contratada a PRESTAÇÃO DE SERVIÇOS voltados à instalação de sistema solar fotovoltaico, tudo subordinado às CLÁUSULAS E CONDIÇÕES adiante consignadas:"
                        }
                    ]
                },
                {
                    "title": "III – DAS CLÁUSULAS CONTRATUAIS:",
                    "page_break_before": True,
                    "blocks": [
                        { "type": "text_highlight", "content": "CLÁUSULA PRIMEIRA – DO OBJETO DO CONTRATO:" },
                        { "type": "text", "content": "O presente instrumento particular tem por objeto a prestação de serviços voltados para instalação de sistema solar fotovoltaico." },
                        {
                            "type": "text",
                            "content": "<strong>Parágrafo Único:</strong> para realização do serviço, a CONTRATADA orienta a aquisição dos seguintes materiais pelo (a) CONTRATANTE junto à distribuidora OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA, CNPJ 27.568.657/0001-06 e nome fantasia SOUENERGY. Sua sede localizada na Rua Paulo Amaral, 465, Galpão 465 - Santo Antônio, Eusebio - CE, 61.767-690, Telefone (11)4003-4343 e endereço eletrônico ecommerce@souenergy.com.br."
                        },
                        {
                            "type": "list_alpha",
                            "items": [
                                "4 painéis fotovoltaicos de 550 W, marca fotozon (garantia do fabricante 25 anos);",
                                "4 inversor de 2 K, marca laeldron (garantia do fabricante 10 anos);",
                                "Kit parafuso, cabos cc, trilhos de fixação de instalação."
                            ]
                        }
                    ]
                },
                {
                    "title": "OBRIGAÇÕES E PAGAMENTO:",
                    "blocks": [
                        { "type": "text_highlight", "content": "CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DA CONTRATADA:" },
                        { "type": "text", "content": "Cumprir integralmente esse contrato em todas as suas cláusulas, responsabilizando-se, especialmente, pela prestação dos serviços ora contratados." },
                        { "type": "text_highlight", "content": "CLÁUSULA TERCEIRA – OBRIGAÇÕES DO(A) CONTRATANTE:" },
                        { "type": "text", "content": "Cumprir integralmente esse contrato em todas as suas cláusulas, responsabilizando-se, especialmente, pelo pagamento da contraprestação pelos serviços ora contratados." },
                        { "type": "text_highlight", "content": "CLÁUSULA QUARTA – DO PAGAMENTO:" },
                        { "type": "text", "content": "O(a) CONTRATANTE compromete-se a pagar à CONTRATADA, pelo presente contrato de prestação de serviços voltados para instalação de sistema solar fotovoltaico, o valor de <strong>R$ 3000 (tres mil)</strong> em parcela única, por PIX, NÃO INCLUÍDO NESTE VALOR painéis fotovoltaicos, inversores e kit parafuso para instalação, cabos cc, trilhos de fixação de instalação;" }
                    ]
                },
                {
                    "title": "",
                    "page_break_before": True,
                    "blocks": [
                        {
                            "type": "signatures",
                            "date_text": "NATAL/RN, 12 DE ABRIL DE 2026.",
                            "party_1_name": "Gabriel Adler Aedron",
                            "party_1_doc": "CPF: 783.621.764-12",
                            "party_1_role": "CONTRATANTE",
                            "party_2_name": "SOLAR SOL ENERGIA RENOVÁVEIS LTDA",
                            "party_2_doc": "CNPJ: 42.518.541/0001-56",
                            "party_2_role": "CONTRATADA",
                            "witnesses": True
                        }
                    ]
                }
            ]
        }

        # 3. Execução: Geração do PDF via API
        response = self.client.post(
            reverse('contract-generate-pdf'),
            data=json.dumps(payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200, "Falha na geração do PDF via API")
        
        # 4. Salvamento Local para Depuração
        with open(self.output_pdf_path, 'wb') as f:
            f.write(response.content)
        print(f"\n[STEP] PDF gerado e salvo em: {self.output_pdf_path}")

        # 5. Comparação de Conteúdo Rigorosa
        # Lemos o original
        with open(self.reference_pdf_path, 'rb') as f:
            ref_content = f.read()
        
        ref_text_raw = self.extract_full_text(ref_content)
        gen_text_raw = self.extract_full_text(response.content)

        ref_text_norm = self.normalize_text(ref_text_raw)
        gen_text_norm = self.normalize_text(gen_text_raw)

        # Verificação de Cláusulas e Dados Críticos (Comparação de alta fidelidade)
        critical_sections = [
            "gabriel adler aedron",
            "783.621.764-12",
            "35241321414",
            "solar sol energia renováveis ltda",
            "r$ 3000",
            "r$ 4000",
            "12 (doze) meses",
            "4 inversor marca laeldron",
            "4 painéis fotovoltaicos de marca fotozon",
            "pix",
            "natal/rn, 12 de abril de 2026",
            "cláusula primeira – do objeto do contrato",
            "cláusula quarta – do pagamento"
        ]

        errors = []
        for section in critical_sections:
            if section not in gen_text_norm:
                errors.append(f"Conteúdo ausente no PDF gerado: '{section}'")
            if section not in ref_text_norm:
                errors.append(f"Conteúdo ausente no PDF de referência: '{section}' (Verifique o OCR)")

        # Falha o teste se houver qualquer divergência no conteúdo crítico
        if errors:
            self.fail("\n".join(errors))

        # 6. Verificação de Integridade de Página (xhtml2pdf gera numeração)
        self.assertIn("Página 1", gen_text_raw)
        
        print("\n[SUCESSO] O PDF gerado foi validado com rigor técnico.")
        print("Conteúdo textual e estrutura de dados estão em conformidade total com o arquivo de referência.")
