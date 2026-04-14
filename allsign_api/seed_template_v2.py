import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import ContractTemplate

template_content = {
  "sections": [
    {
      "id": "qualificacao",
      "title": "I – DA QUALIFICAÇÃO DAS PARTES:",
      "mb": True,
      "underline": True,
      "blocks": [
        {
          "type": "text",
          "content": "<strong>Contratante:</strong> <span class=\"font-bold uppercase\">{{ client_name }}</span>, {{ nationality }}, inscrito no CPF sob o nº <span class=\"font-bold\">{{ client_cpf }}</span>, RG nº <span class=\"font-bold\">{{ client_rg }}</span>, residente e domiciliado na Rua {{ client_street }}, nº {{ client_number }}, Bairro {{ client_neighborhood }}, Cidade {{ client_city }}, CEP {{ client_cep }}, portador do celular nº {{ client_phone }} e endereço eletrônico {{ client_email }}, de ora em diante denominado(a) de CONTRATANTE."
        },
        {
          "type": "text",
          "mt": True,
          "content": "<strong>Contratada: SOLAR SOL ENERGIA RENOVÁVEIS LTDA</strong>, pessoa jurídica de direito privado, inscrita sob o CNPJ nº 42.518.541/0001-56, com endereço comercial na Avenida Prudente de Morais, nº 0507, Centro Empresarial Djalma Marinho, Loja A, Tirol, Natal/RN, CEP 590.20-810, neste ato representado por seu sócio, Sr. Lucas Luís de Oliveira Barbosa, portador do RG nº 2189466 e CREA nº 2119764026, de ora em diante denominada de CONTRATADA."
        }
      ]
    },
    {
      "id": "quadro_resumo",
      "title": "II – DO QUADRO RESUMO:",
      "page_break_before": False,
      "mb": True,
      "underline": True,
      "blocks": [
        {
          "type": "structured_table",
          "rows": [
            { "label": "VALOR DO SERVIÇO PARA SOLAR SOL ENERGIA RENOVÁVEIS LTDA", "value": "R$ {{ service_value }}", "bold_value": True },
            { "label": "VALOR DO EQUIPAMENTO PARA OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA", "value": "R$ {{ equipment_value }}", "bold_value": True },
            { "label": "VIGÊNCIA DO CONTRATO", "value": "{{ validity }}", "bold_value": True, "uppercase_value": True },
            { 
              "label": "EQUIPAMENTOS ADQUIRIDOS", 
              "value_list": [
                "{{ inverter_quantity }} INVERSOR MARCA {{ inverter_brand }}",
                "{{ panels_quantity }} PAINÉIS FOTOVOLTAICOS DE MARCA {{ panels_brand }}",
                "KIT, CABOS CC, PARAFUSO, TRILHOS DE FIXAÇÃO DE INSTALAÇÃO"
              ],
              "uppercase_value": True
            },
            { "label": "DATA DE VENCIMENTO DO PAGAMENTO DO SERVIÇO", "value": "{{ due_date }}", "bold_value": True, "uppercase_value": True },
            { "label": "FORMA DE PAGAMENTO", "value": "{{ payment_method }}", "bold_value": True, "uppercase_value": True },
            { "label": "UNIDADES BENEFICIARIAS", "value": "{{ beneficiary_units }}", "bold_value": True, "uppercase_value": True }
          ]
        },
        {
          "type": "text",
          "mt": True,
          "content": "Pelo presente instrumento particular as partes, CONTRATADA e CONTRATANTE, têm entre si, certa, ajustada e contratada a PRESTAÇÃO DE SERVIÇOS voltados à instalação de sistema solar fotovoltaico, tudo subordinado às CLÁUSULAS E CONDIÇÕES adiante consignadas:"
        }
      ]
    },
    {
      "id": "clausulas",
      "title": "III – DAS CLÁUSULAS CONTRATUAIS:",
      "page_break_before": True,
      "underline": True,
      "blocks": [
        {
          "type": "text_highlight",
          "content": "CLÁUSULA PRIMEIRA – DO OBJETO DO CONTRATO:"
        },
        {
          "type": "text",
          "content": "O presente instrumento particular tem por objeto a prestação de serviços voltados para instalação de sistema solar fotovoltaico."
        },
        {
          "type": "text",
          "mt": True,
          "content": "<strong>Parágrafo Único:</strong> para realização do serviço, a CONTRATADA orienta a aquisição dos seguintes materiais pelo (a) CONTRATANTE junto à distribuidora <strong>OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA, CNPJ 27.568.657/0001-06</strong> e nome fantasia <strong>SOUENERGY</strong>. Sua sede localizada na Rua Paulo Amaral, 465, Galpão 465 - Santo Antônio, Eusebio - CE, 61.767-690, Telefone (11)4003-4343 e endereço eletrônico ecommerce@souenergy.com.br."
        },
        {
          "type": "list_alpha",
          "items": [
            "a) {{ panels_quantity }} painéis fotovoltaicos de {{ panels_watts }} W, marca {{ panels_brand }} (garantia do fabricante {{ panels_warranty }} anos);",
            "b) {{ inverter_quantity }} inversor de {{ inverter_k }} K, marca {{ inverter_brand }} (garantia do fabricante {{ inverter_warranty }} anos);",
            "c) Kit parafuso, cabos cc, trilhos de fixação de instalação."
          ]
        },
        {
          "type": "text_highlight",
          "content": "CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DA CONTRATADA:"
        },
        {
          "type": "text",
          "content": "Cumprir integralmente esse contrato em todas as suas cláusulas, responsabilizando-se, especialmente, pela prestação dos serviços ora contratados."
        },
        {
          "type": "text",
          "mt": True,
          "content": "<strong>Parágrafo Único:</strong> Ainda resta, por este contrato, obrigada a CONTRATADA a:"
        },
        {
          "type": "list_alpha",
          "items": [
            "a) Realizar o pagamento de todos os encargos sociais e tributos previstos em lei, relacionados ao objeto deste contrato de prestação de serviço;",
            "b) Fornecer ao(à) CONTRATANTE todos os dados e informações, quando solicitados, que se fizerem necessários ao bom entendimento e acompanhamento do serviço contratado;"
          ]
        }
      ]
    },
    {
      "id": "assinaturas",
      "title": "",
      "page_break_before": True,
      "blocks": [
        {
          "type": "text",
          "content": "E, por estarem justas e contratadas, as partes assinam este contrato, em 02 (duas) vias de igual teor e forma, juntamente com as testemunhas abaixo."
        },
        {
          "type": "signatures",
          "date_text": "NATAL/RN, {{ date_day }} DE {{ date_month }} DE {{ date_year }}.",
          "party_1_name": "{{ client_name }}",
          "party_1_doc": "CPF: {{ client_cpf }}",
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

template, created = ContractTemplate.objects.get_or_create(
    name="Modelo V2 (Avançado) - Energia Solar",
    defaults={
        "category": "Solar",
        "description": "Modelo renderizado via blocos dinâmicos.",
        "content": template_content
    }
)

if not created:
    template.content = template_content
    template.save()

print("Template V2 criado com sucesso!")
