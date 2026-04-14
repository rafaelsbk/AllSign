import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import ContractTemplate

template_content = {
  "sections": [
    {
      "id": "sec_qualificacao",
      "title": "I – DA QUALIFICAÇÃO DAS PARTES:",
      "mb": True,
      "underline": True,
      "page_break_before": False,
      "blocks": [
        {
          "type": "text",
          "content": "<strong>INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS VOLTADOS PARA INSTALAÇÃO DE SISTEMA SOLAR FOTOVOLTAICO</strong>",
          "mt": False,
          "uppercase": True
        },
        {
          "type": "text",
          "content": "<strong>CONTRATO N º ON-RN-{{contract_number}}-2025</strong>",
          "mt": True
        },
        {
          "type": "text",
          "content": "<strong>Contratante:</strong> <span class=\"font-bold uppercase\">{{client_name}}</span>, {{nationality}}, inscrito no CPF sob o nº <span class=\"font-bold\">{{client_cpf}}</span>, RG nº <span class=\"font-bold\">{{client_rg}}</span>, residente e domiciliado na Rua {{client_street}}, nº {{client_number}}, Bairro {{client_neighborhood}}, Cidade {{client_city}}, CEP {{client_cep}}, portador do celular nº {{client_phone}} e endereço eletrônico {{client_email}}, de ora em diante denominado(a) de CONTRATANTE.",
          "mt": True
        },
        {
          "type": "text",
          "content": "<strong>Contratada: SOLAR SOL ENERGIA RENOVÁVEIS LTDA</strong>, pessoa jurídica de direito privado, inscrita sob o CNPJ nº 42.518.541/0001-56, com endereço comercial na Avenida Prudente de Morais, nº 0507, Centro Empresarial Djalma Marinho, Loja A, Tirol, Natal/RN, CEP 590.20-810, neste ato representado por seu sócio, Sr. Lucas Luís de Oliveira Barbosa, portador do RG nº 2189466 e CREA nº 2119764026, de ora em diante denominada de CONTRATADA.",
          "mt": True
        }
      ]
    },
    {
      "id": "sec_resumo",
      "title": "II – DO QUADRO RESUMO:",
      "mb": True,
      "underline": True,
      "page_break_before": False,
      "blocks": [
        {
          "type": "structured_table",
          "rows": [
            { "label": "VALOR DO SERVIÇO PARA SOLAR SOL ENERGIA RENOVÁVEIS LTDA", "value": "R$ {{service_value}}", "bold_value": True },
            { "label": "VALOR DO EQUIPAMENTO PARA OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA", "value": "R$ {{equipment_value}}", "bold_value": True },
            { "label": "VIGÊNCIA DO CONTRATO", "value": "{{validity}}", "bold_value": True },
            { 
              "label": "EQUIPAMENTOS ADQUIRIDOS", 
              "value": "{{inverter_quantity}} INVERSOR MARCA {{inverter_brand}}; {{panels_quantity}} PAINÉIS MARCA {{panels_brand}}; KIT, CABOS CC, PARAFUSO, TRILHOS",
              "bold_value": True
            },
            { "label": "DATA DE VENCIMENTO DO PAGAMENTO", "value": "{{due_date}}", "bold_value": True },
            { "label": "FORMA DE PAGAMENTO", "value": "{{payment_method}}", "bold_value": True },
            { "label": "UNIDADES BENEFICIARIAS", "value": "{{beneficiary_units}}", "bold_value": True }
          ]
        },
        {
          "type": "text",
          "content": "Pelo presente instrumento particular as partes, CONTRATADA e CONTRATANTE, têm entre si, certa, ajustada e contratada a PRESTAÇÃO DE SERVIÇOS voltados à instalação de sistema solar fotovoltaico, tudo subordinado às CLÁUSULAS E CONDIÇÕES adiante consignadas:",
          "mt": True
        }
      ]
    },
    {
      "id": "sec_clausulas",
      "title": "III – DAS CLÁUSULAS CONTRATUAIS:",
      "mb": True,
      "underline": True,
      "page_break_before": True,
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA PRIMEIRA – DO OBJETO DO CONTRATO:" },
        { "type": "text", "content": "O presente instrumento particular tem por objeto a prestação de serviços voltados para instalação de sistema solar fotovoltaico." },
        { 
          "type": "text", 
          "content": "<strong>Parágrafo Único:</strong> para realização do serviço, a CONTRATADA orienta a aquisição dos seguintes materiais pelo (a) CONTRATANTE junto à distribuidora OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA...",
          "mt": True
        },
        {
          "type": "list_alpha",
          "items": [
            "{{panels_quantity}} painéis fotovoltaicos de {{panels_watts}} W, marca {{panels_brand}} (garantia do fabricante {{panels_warranty}} anos);",
            "{{inverter_quantity}} inversor de {{inverter_k}} K, marca {{inverter_brand}} (garantia do fabricante {{inverter_warranty}} anos);",
            "Kit parafuso, cabos cc, trilhos de fixação de instalação."
          ]
        }
      ]
    },
    {
      "id": "sec_obrigacoes",
      "title": "DAS OBRIGAÇÕES:",
      "mb": True,
      "underline": False,
      "page_break_before": False,
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DA CONTRATADA:" },
        { "type": "text", "content": "Cumprir integralmente esse contrato em todas as suas cláusulas, responsabilizando-se pela prestação dos serviços ora contratados." },
        { "type": "text", "content": "<strong>Parágrafo Único:</strong> Ainda resta, por este contrato, obrigada a CONTRATADA a:", "mt": True },
        {
          "type": "list_alpha",
          "items": [
            "Realizar o pagamento de todos os encargos sociais e tributos previstos em lei;",
            "Fornecer ao(à) CONTRATANTE todos os dados e informações necessários;",
            "Realizar procedimentos junto à concessionária de energia e Conselho de Classe."
          ]
        }
      ]
    },
    {
      "id": "sec_pagamento",
      "title": "DO PAGAMENTO:",
      "mb": True,
      "underline": False,
      "page_break_before": False,
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA QUARTA – DO PAGAMENTO:" },
        { 
          "type": "text", 
          "content": "O(a) CONTRATANTE compromete-se a pagar à CONTRATADA o valor de <strong>R$ {{service_value}} ({{service_value_extenso}})</strong> em parcela única, por {{payment_method}}." 
        },
        { 
          "type": "text", 
          "content": "<strong>Parágrafo Segundo:</strong> O pagamento será efetuado {{due_date}}, nas contas abaixo indicadas:", 
          "mt": True 
        },
        { "type": "text", "content": "● <strong>Sicredi - 748:</strong> Agência (2207), Conta Corrente (43455-8), PIX (42.518.541/0001-56);" },
        { "type": "text", "content": "● <strong>Banco do Brasil - 001:</strong> Agência (1533-4), Conta Corrente (65257-1);" },
        { "type": "text", "content": "● <strong>Banco Santander - 003:</strong> Agência (4667), Conta Corrente (13004130-3) PIX (allsolenergias@gmail.com)." }
      ]
    },
    {
      "id": "sec_assinaturas",
      "title": "",
      "mb": True,
      "underline": False,
      "page_break_before": True,
      "blocks": [
        { "type": "text", "content": "E, por estarem justas e contratadas, as partes assinam este contrato, em 02 (duas) vias de igual teor e forma." },
        {
          "type": "signatures",
          "date_text": "NATAL/RN, {{date_day}} DE {{date_month}} DE {{date_year}}.",
          "party_1_name": "{{client_name}}",
          "party_1_doc": "CPF: {{client_cpf}}",
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
    name="Modelo V2 - Completo Energia Solar",
    defaults={
        "category": "Solar",
        "description": "Modelo profissional com todas as seções do contrato Gabriel Adler.",
        "content": template_content
    }
)

if not created:
    template.content = template_content
    template.save()

print("Modelo V2 Profissional criado com sucesso!")
