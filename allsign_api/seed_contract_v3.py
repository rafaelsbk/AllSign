import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import ContractTemplate

template_content = {
  "sections": [
    {
      "id": "sec_header",
      "title": "",
      "blocks": [
        {
          "type": "text",
          "content": "<strong>INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS VOLTADOS PARA INSTALAÇÃO DE SISTEMA SOLAR FOTOVOLTAICO</strong>",
          "text_align": "center",
          "uppercase": True
        },
        {
          "type": "text",
          "content": "<strong>CONTRATO N º ON-RN-{{contract_number}}-2025</strong>",
          "text_align": "center",
          "mt": True
        }
      ]
    },
    {
      "id": "sec_qualificacao",
      "title": "I – DA QUALIFICAÇÃO DAS PARTES:",
      "mb": True,
      "underline": True,
      "blocks": [
        {
          "type": "text",
          "content": "<strong>Contratante:</strong> {{client_name}}, Brasileiro (a), inscrito no CPF sob o nº {{client_cpf}}, RG nº {{client_rg}}, residente e domiciliado na Rua {{client_street}}, nº {{client_number}}, Bairro {{client_neighborhood}}, Cidade {{client_city}}, CEP {{client_cep}}, portador do celular nº {{client_phone}} e endereço eletrônico {{client_email}}, de ora em diante denominado(a) de CONTRATANTE.",
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
      "blocks": [
        {
          "type": "structured_table",
          "rows": [
            { "label": "VALOR DO SERVIÇO PARA SOLAR SOL ENERGIA RENOVÁVEIS LTDA", "value": "R$ {{service_value}}", "bold_value": True },
            { "label": "VALOR DO EQUIPAMENTO PARA OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA", "value": "R$ {{equipment_value}}", "bold_value": True },
            { "label": "VIGÊNCIA DO CONTRATO", "value": "{{validity}}", "bold_value": True },
            { 
              "label": "EQUIPAMENTOS ADQUIRIDOS", 
              "value_list": [
                "{{inverter_quantity}} INVERSOR MARCA {{inverter_brand}}",
                "{{panels_quantity}} PAINÉIS FOTOVOLTAICOS DE MARCA {{panels_brand}}",
                "KIT, CABOS CC, PARAFUSO, TRILHOS DE FIXAÇÃO DE INSTALAÇÃO"
              ],
              "bold_value": True 
            },
            { "label": "DATA DE VENCIMENTO DO PAGAMENTO DO SERVIÇO", "value": "{{due_date}}", "bold_value": True },
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
      "id": "sec_clausulas_1",
      "title": "III – DAS CLÁUSULAS CONTRATUAIS:",
      "mb": True,
      "underline": True,
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA PRIMEIRA – DO OBJETO DO CONTRATO:" },
        { "type": "text", "content": "O presente instrumento particular tem por objeto a prestação de serviços voltados para instalação de sistema solar fotovoltaico." },
        { 
          "type": "text", 
          "content": "<strong>Parágrafo Único:</strong> para realização do serviço, a CONTRATADA orienta a aquisição dos seguintes materiais pelo (a) CONTRATANTE junto à distribuidora OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA, CNPJ 27.568.657/0001-06 e nome fantasia SOUENERGY. Sua sede localizada na Rua Paulo Amaral, 465, Galpão 465 - Santo Antônio, Eusebio - CE, 61.767-690, Telefone (11)4003-4343 e endereço eletrônico ecommerce@souenergy.com.br.",
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
      "id": "sec_clausula_segunda",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DA CONTRATADA:" },
        { "type": "text", "content": "Cumprir integralmente esse contrato em todas as suas cláusulas, responsabilizando-se, especialmente, pela prestação dos serviços ora contratados." },
        { "type": "text", "content": "<strong>Parágrafo Único:</strong> Ainda resta, por este contrato, obrigada a CONTRATADA a:", "mt": True },
        {
          "type": "list_alpha",
          "items": [
            "Realizar o pagamento de todos os encargos sociais e tributos previstos em lei, relacionados ao objeto deste contrato de prestação de serviço;",
            "Fornecer ao(à) CONTRATANTE todos os dados e informações, quando solicitados, que se fizerem necessários ao bom entendimento e acompanhamento do serviço contratado;",
            "Realizar os seguintes procedimentos junto à concessionaria de energia: apresentação de projeto e acompanhamento do procedimento até sua homologação.",
            "Realizar os seguintes procedimentos junto ao Conselho de Classe (CFT, CRT ou CREA): apresentação de projeto e execução da obra.",
            "Planejar, conduzir e executar os serviços, com integral observância das disposições deste contrato, obedecendo aos prazos contratuais e às normas vigentes, em especial a instalação de sistema solar em capacitação calculada de acordo a expectativa de média anual dos índices de radiação;",
            "Designar como responsáveis, pela direção e execução dos serviços, profissionais devidamente capacitados e qualificados para suas respectivas funções, bem como utilizar equipamentos adequados à perfeita realização dos serviços;",
            "Empregar na execução dos serviços toda a mão de obra necessária, com habilidade técnica adequada ao exercício de suas atribuições, assumindo toda a responsabilidade por eventuais encargos trabalhistas, incluindo àqueles decorrentes do reconhecimento de vínculo empregatício;",
            "Orientar os profissionais sob sua responsabilidade a cumprir todas as normas disciplinares e de segurança, fornecendo os Equipamentos de Proteção Individual e Coletiva e fiscalizando sua correta utilização;"
          ]
        }
      ]
    },
    {
      "id": "sec_clausula_terceira",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA TERCEIRA – OBRIGAÇÕES DO(A) CONTRATANTE:" },
        { "type": "text", "content": "Cumprir integralmente esse contrato em todas as suas cláusulas, responsabilizando-se, especialmente, pelo pagamento da contraprestação pelos serviços ora contratados." },
        { "type": "text", "content": "<strong>Parágrafo Único:</strong> Ainda resta, por este contrato, obrigado (a) o (a) CONTRATANTE a:", "mt": True },
        {
          "type": "list_alpha",
          "items": [
            "Responsabilizar-se pela adequação de seu PADRÃO DE ENTRADA às normas vigentes, regida pela concessionária de energia e pelos órgãos de regulamentação estadual;",
            "Facilitar o acesso dos profissionais contratados ao local da obra, caso necessário;",
            "Fornecer corretamente todos os dados e informações necessárias à execução dos serviços contratados, prestando assistência à CONTRATADA no cumprimento de seus deveres decorrentes deste contrato;",
            "O(a) CONTRATANTE se obriga a realizar quaisquer adaptações ou obras (civil, estrutural, ampliação ou reforço) solicitadas pela CONTRATADA antes ou durante o início da obra, visando a assegurar o pleno funcionamento do sistema contratado;",
            "O(a) CONTRANTE terá a obrigação de conferencia integral do seu equipamento no momento da entrega, averiguando a quantidade de itens prescritos e abertura dos volumes que outrora venham em embalagens lacradas atestando sua plena forma ou possíveis avarias no transporte se responsabilizando pela informação das devidas intercorrências em nota fiscal entregue através de transportadora definida pelo distribuidor ora escolhido pelo CONTRATANTE.",
            "O(a) CONTRANTE será responsável por receber os profissionais da concessionária de energia sempre que necessário, seja para vistoria, aumento de carga, manutenção ou qualquer outro serviço relacionado."
          ]
        }
      ]
    },
    {
      "id": "sec_clausula_quarta",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA QUARTA – DO PAGAMENTO:" },
        { 
          "type": "text", 
          "content": "O(a) CONTRATANTE compromete se a pagar à CONTRATADA, pelo presente contrato de prestação de serviços voltada para instalação de sistema solar fotovoltaico, o valor de <strong>R$ {{service_value}} ({{service_value_extenso}})</strong> em parcela única, por transferência bancária, PIX, boleto ou cartão de credito (sendo esta última opção com taxas adicionais cobradas pela operadora do cartão), NÃO INCLUÍDO NESTE VALOR painéis fotovoltaicos, inversores e kit parafuso para instalação, cabos cc, trilhos de fixação de instalação;"
        },
        { 
          "type": "text", 
          "content": "<strong>Parágrafo Primeiro:</strong> O(a) CONTRATANTE compromete-se a adquirir os materiais descritos nas alíneas a, b e c, Parágrafo Único da CLÁUSULA PRIMEIRA deste contrato, quais sejam, painéis fotovoltaicos, inversores, kit parafuso para instalação, cabos cc e trilhos de fixação de instalação, no valor de <strong>R$ {{equipment_value}} ({{equipment_value_extenso}})</strong> através de transferência bancária, PIX, boleto ou cartão de credito, valor este que será pago diretamente à respectivo distribuidor OK ENERGY IMPORTAÇÃO E EXPORTAÇÃO LTDA;",
          "mt": True
        },
        { 
          "type": "text", 
          "content": "<strong>Parágrafo Segundo:</strong> O pagamento pela prestação dos serviços de instalação mencionados no caput desta cláusula será efetuado {{due_date}}, em parcela única, através de transferência bancária, PIX, boleto ou cartão de credito (sendo esta última opção com taxas adicionais cobradas pela operadora do cartão), diretamente nas contas abaixo indicadas:",
          "mt": True
        },
        { "type": "text", "content": "● <strong>Sicredi - 748:</strong> Agência (2207), Conta Corrente (43455-8), PIX (42.518.541/0001-56);", "mt": True },
        { "type": "text", "content": "● <strong>Banco do Brasil - 001:</strong> Agência (1533-4), Conta Corrente (65257-1);" },
        { "type": "text", "content": "● <strong>Caixa Econômica Federal - 104:</strong> Agência (0759), Conta Corrente (3932-4)" },
        { "type": "text", "content": "● <strong>Banco Santander - 003:</strong> Agência (4667), Conta Corrente (13004130-3) PIX (allsolenergias@gmail.com);" },
        { 
          "type": "text", 
          "content": "<strong>Parágrafo Terceiro:</strong> Em caso de pedido de mudança de endereço, poderá haver cobrança de novos valores para instalação em nova localidade.",
          "mt": True
        },
        { 
          "type": "text", 
          "content": "<strong>Parágrafo Quarto:</strong> O pagamento ao distribuidor dos equipamentos/materiais descritos nas alíneas a, b e c, Parágrafo Único da CLÁUSULA PRIMEIRA deste contrato, quais sejam, painéis fotovoltaicos, inversores, kit parafuso para instalação, cabos cc e trilhos de fixação de instalação etc. será efetuado na data de assinatura do presente contrato, em conta bancária de titularidade do aludido distribuidor ou por outro meio de pagamento. Fica estabelecido que caberá ao CONTRATANTE a responsabilidade de encaminhar à CONTRATADA o respectivo comprovante de pagamento, sendo tal envio condição indispensável para o início dos trâmites de homologação da usina fotovoltaica junto à concessionária de energia.",
          "mt": True
        }
      ]
    },
    {
      "id": "sec_clausula_quinta",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA QUINTA – DOS PRAZOS DE INSTALAÇÃO E DA HOMOLOGAÇÃO:" },
        { "type": "text", "content": "O prazo de instalação dos devidos equipamentos do presente contrato é de 90 (noventa) dias iniciando-se a contagem a partir da assinatura deste contrato, acompanhado de todos os documentos necessários à confirmação da referida contratação." },
        { "type": "text", "content": "<strong>Parágrafo Primeiro:</strong> Todas as datas e prazos contidos nas cláusulas deste contrato deverão ser contabilizados em dias úteis.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Segundo:</strong> Serão descontados do prazo mencionado no caput desta CLÁUSULA, dias chuvosos que não permitam o desenvolvimento dos trabalhos de instalação;", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Terceiro:</strong> Fica convencionado entre as partes que, em caso de inexistência de medidor, medidor inadequado ou necessidade de aumento de carga para a conexão da usina fotovoltaica junto à unidade consumidora, bem como em situações de atraso ou pendências na aprovação do projeto e/ou na instalação do referido medidor por parte da concessionária de energia, o prazo previsto no caput desta Cláusula será automaticamente suspenso. A contagem do prazo será retomada somente após a efetiva instalação do medidor e a autorização formal da concessionária para a conexão do sistema à rede elétrica.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Quarto:</strong> Para que o processo de homologação do sistema solar fotovoltaico seja formalizado é indispensável que as faturas de energia da unidade geradora e compensadoras não constem débitos sem quitação, e, uma vez existentes, o prazo para execução de presente contrato só será retomado após quitação do valor no sistema da concessionária.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Quinto:</strong> Havendo necessidade de aumento de carga, reforço na rede da concessionária, reforço na estrutura, pendências junto à concessionária ou qualquer outro fator que demande mais tempo para a conclusão da instalação e homologação, e/ou terceiros que impeçam o protocolo e a aprovação do projeto junto à companhia de energia, a contagem do prazo previsto no caput desta CLÁUSULA retornará somente após a efetiva regularização das demandas apontadas, podendo estender o prazo de acordo com as normativas da ANEEL.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Sexto:</strong> Ocorrendo alguma das situações previstas nos parágrafos anteriores, o(a) CONTRATANTE se obriga a comunicar formalmente, a conclusão de quaisquer adequações necessárias ao andamento da obra e solução de eventuais pendências, por meio de e-mail: allsolenergias@gmail.com, WhatsApp ou outro meio de comunicação. Da mesma forma, caso o CONTRATANTE tenha conhecimento de alguma dessas situações, deverá comunicá-las.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Sétimo:</strong> Os prazos serão suspensos desde o protocolo junto à concessionária de energia até a apresentação da resposta de aprovação, retomando a contagem após a devolutiva de aprovação por parte da concessionária. Igualmente ocorrerá nos demais prazos que dependam de processos de validação em órgãos públicos.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Oitavo:</strong> Com relação ao prazo exclusivo da homologação, a CONTRATADA esclarece que o processo de homologação do sistema fotovoltaico depende exclusivamente da análise, aprovação e prazos internos da concessionária de energia e, em alguns casos, de outros órgãos públicos.", "mt": True },
        { "type": "text", "content": "Assim, eventuais atrasos decorrentes desses trâmites não poderão ser imputados à CONTRATADA, por se tratarem de etapas fora de seu controle direto. Desde já, a CONTRATADA se compromete a acompanhar e prestar todo o suporte necessário para o bom andamento do processo junto à concessionária.", "mt": True }
      ]
    },
    {
      "id": "sec_clausula_sexta",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA SEXTA – DA RESPONSABILIDADE DA CONCESSIONÁRIA:" },
        { "type": "text", "content": "A CONTRATADA compromete-se a prestar o suporte necessário ao CONTRATANTE durante o processo de homologação e conexão da usina solar fotovoltaica à rede elétrica. A definição dos prazos, bem como a aprovação final para a conexão da unidade geradora, é de responsabilidade exclusiva da concessionária de energia, que realiza uma análise técnica baseada nas condições e limitações da rede local." },
        { "type": "text", "content": "Essa análise poderá abranger aspectos como inversão de fluxo de energia, limitações da rede elétrica, aumento de carga, necessidade de inclusão de transformador, entre outros fatores técnicos. Tais decisões são de competência exclusiva da concessionária, isentando a CONTRATADA de qualquer responsabilidade caso essas condições sejam identificadas no processo.", "mt": True },
        { "type": "text", "content": "Se forem necessárias adequações técnicas para viabilizar a conexão da usina, como reforço da estrutura da rede, substituição ou instalação de transformadores, ou qualquer outra intervenção técnica, essas exigências poderão ser definidas pela concessionária. Nesses casos, o CONTRATANTE poderá ser solicitado a arcar com os investimentos necessários para atender às condições estabelecidas por parte da concessionaria.", "mt": True },
        { "type": "text", "content": "A CONTRATADA continuará prestando suporte técnico ao CONTRATANTE, orientando-o em todas as etapas e esclarecendo eventuais dúvidas. A liberação final da unidade geradora, entretanto, dependerá exclusivamente da aprovação da concessionária, podendo estar sujeita a ajustes técnicos que não estavam previstos no projeto inicial, sem que haja responsabilidade da CONTRATADA por essas modificações.", "mt": True }
      ]
    },
    {
      "id": "sec_clausula_setima",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA SÉTIMA – DO RECEBIMENTO E ENCERRAMENTO DOS SERVIÇOS:" },
        { "type": "text", "content": "O recebimento definitivo dos serviços deverá ser precedido de uma vistoria por parte do (a) CONTRATANTE, para que este (a) verifique e comprove a satisfatória execução de todos os serviços." }
      ]
    },
    {
      "id": "sec_clausula_oitava",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA OITAVA – DA GERAÇÃO DE ENERGIA ELÉTRICA:" },
        { "type": "text", "content": "A geração de energia do sistema fotovoltaico depende das condições climáticas, com base em dados oficiais do Centro de Referência para Energia solar e eólica e Instituto Nacional de Pesquisas Espaciais. Após aferição de todos esses dados técnicos e geográficos, se chegará a uma geração média estimada, apresentada em proposta comercial;" },
        { "type": "text", "content": "<strong>Parágrafo Primeiro:</strong> Registre-se que a geração de energia é feita de acordo com a média base calculada de acordo com as contas apresentadas, podendo haver pedido pelo (a) CONTRATANTE de geração maior que a média, fato que impactará no valor do serviço ora prestado;", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Segundo:</strong> Caso haja compensação de energia em mais de um local, é necessário que o (a) CONTRATANTE solicite conexão junto à concessionária de energia, serviço esse que poderá ser promovido pela CONTRATADA, sendo objeto de compensação no presente contrato as contas {{beneficiary_units}}.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Terceiro:</strong> O endereço da instalação dos painéis será compensado de forma primária e a(s) unidade(s) secundária(s) somente serão compensadas após total satisfação da geração da unidade de instalação, em conformidade com a Lei nº 14.300/2022, a qual define as diretrizes acerca do Sistema de Compensação de Energia;", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Quarto:</strong> Caso o(a) CONTRATANTE solicite a inserção de uma conta contrato em sua lista de rateio após a homologação de sua usina solar, será cobrado um valor adicional de R$ 250,00 (duzentos e cinquenta reais), referente aos custos técnicos;", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Quinto:</strong> Existindo a necessidade de ajustes na potência de painéis e inversores, poderão as partes optar pela substituição, devendo as referidas alterações serem registradas através de aditivo contratual, cabendo à CONTRARADA realizar a intermediação da substituição junto ao fabricante;", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Sexto:</strong> O sistema de energia solar depende de fatores naturais, como a irradiação solar e as condições climáticas, além de aspectos específicos do imóvel, como a presença de obstruções no telhado que possam afetar a geração (exemplo: platibanda, caixa d'água, entre outras estruturas), assim como a inclinação, a orientação do telhado e a qualidade da energia fornecida pela concessionária local. Nesse contexto, o CONTRATANTE está ciente de que a geração de energia pode sofrer variações, podendo tanto aumentar quanto diminuir. A CONTRATADA não se responsabiliza por essas alterações, uma vez que são decorrentes de condições externas e variáveis. A proposta comercial foi elaborada com base em estimativas, e o desempenho final pode variar conforme as condições mencionadas", "mt": True }
      ]
    },
    {
      "id": "sec_clausula_nona",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA NONA – DO MONITORAMENTO:" },
        { "type": "text", "content": "Para conexão e acompanhamento remoto do sistema via aplicativo se faz necessária a utilização da rede de dados móveis, com internet WI-FI 2,4GHZ, a qual é de responsabilidade da parte CONTRATANTE para garantir a visibilidade de sua produção. Sua inexistência não afetará a geração, contudo, neste caso, ficará o (a) CONTRATANTE sem acompanhamento remoto." },
        { "type": "text", "content": "<strong>Parágrafo Primeiro:</strong> Caso não haja conexão de internet (wifi 2,4GHZ) no dia da instalação do sistema solar, poderá a CONTRATADA atribuir custos relativos à visita posterior para a realização do referido serviço, restando claro que o sistema de acompanhamento remoto é de total importância para a solicitação de garantia do equipamento, sendo ele item obrigatório junto ao fabricante;", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Segundo:</strong> Em caso de alteração de senha da internet ou provedor, o (a) CONTRATANTE precisará informar à CONTRATADA, sob pena de não funcionamento do sistema de acompanhamento remoto (aplicativo), sendo necessário abrir uma ordem de serviço para configuração do aparelho;", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Terceiro:</strong> Em caso de necessidade de visita técnica ao local da instalação para reconfiguração do sistema de monitoramento, será cobrada uma taxa adicional a partir de R$ 250,00 (duzentos e cinquenta reais), destinada a cobrir os custos operacionais com deslocamento, mão de obra técnica e retrabalho da equipe. Ressalta-se que esta cobrança se aplica, especialmente, quando a visita for decorrente de situações de retrabalho, como: ausência de conexão no dia da instalação, alteração de senha da rede Wi-Fi, troca de provedor de internet, desligamento do roteador por longos períodos, mudança do roteador de local ou ainda intervenção de terceiros no equipamento instalado.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Quarto:</strong> Em caso de eventuais falhas técnicas, que afetem no todo ou em parte a geração de energia por parte da concessionária tais como: sobretensão; sobrecorrente e afins; será o acompanhamento remoto (monitoramento) a ferramenta indispensável para averiguar tais falhas e adotar as devidas providências para restauração do funcionamento normal do sistema;", "mt": True }
      ]
    },
    {
      "id": "sec_clausula_decima",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA DÉCIMA – DA GARANTIA:" },
        { "type": "text", "content": "A CONTRATADA garante a qualidade e perfeição da execução do serviço de mão de obra, objeto deste contrato, respondendo, na forma da lei, por quaisquer defeitos decorrentes da prestação de seus serviços verificados no período de 12 meses, a contar da assinatura deste instrumento particular;" },
        { "type": "text", "content": "<strong>Parágrafo Primeiro:</strong> O(a) CONTRATANTE declara-se ciente de que os painéis fotovoltaicos e inversores contam com garantias ofertadas diretamente pelos seus respectivos fabricantes.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Segundo:</strong> Após o vencimento da garantia de instalação (prestação de serviços) dada pela CONTRATADA (12 meses), a execução da cláusula de garantia dos equipamentos acima descritos deverá ser feita através de notificação dirigida à empresa fabricante pelo (a) CONTRANTE;", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Terceiro:</strong> A realização de qualquer serviço por terceiros, incluindo ampliação do sistema, manutenção preventiva ou corretiva relacionada ao objeto deste contrato, dentro do prazo de, 12 (doze) meses de vigência, resultará na perda total da garantia de instalação e na isenção de qualquer outra obrigação da CONTRATADA para com o CONTRATANTE.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Quarto:</strong> Após o término do período de garantia da prestação de serviço, que é de 12 (doze) meses a partir da data da assinatura deste contrato, a CONTRATADA não terá qualquer obrigação quanto a ajustes, correções ou qualquer outra responsabilidade referente à instalação e homologação realizadas, salvo se houver um contrato específico para a prestação desses serviços.", "mt": True }
      ]
    },
    {
      "id": "sec_clausula_decima_primeira",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA DÉCIMA PRIMEIRA – DA CONFIDENCIALIDADE:" },
        { "type": "text", "content": "Toda e qualquer informação técnica, administrativa ou comercial, transmitida verbalmente ou por escrito entre as partes, fornecida durante a prestação de serviços, será considerada como estritamente confidencial pelas partes, as quais se obrigam a não compartilhar com terceiros, utilizando-as exclusivamente para os serviços contratados." },
        { "type": "text", "content": "<strong>Parágrafo Único:</strong> As partes obrigam-se, ainda, a respeitar a Lei Geral sobre Proteção de Dados Pessoais (Lei 13.709/2018) e as determinações de órgãos reguladores e fiscalizadores sobre a matéria.", "mt": True }
      ]
    },
    {
      "id": "sec_clausula_decima_segunda",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA DÉCIMA SEGUNDA – DAS DISPOSIÇÕES GERAIS: Durante a execução do presente contrato ainda deverá ser observado o seguinte:" },
        {
          "type": "list_alpha",
          "items": [
            "A CONTRATADA não se responsabiliza pela falta de cumprimento dos prazos da concessionária, em caso de atraso ou negligência, todavia, se compromete a cobrar do órgão o andamento da solicitação de acesso e da autorização para funcionamento;",
            "O regime de compensação, bem como as diretrizes sobre o sistema de geração distribuída, é de responsabilidade exclusiva da ANEEL, não cabendo à CONTRATADA eventual responsabilidade sobre quaisquer alterações normativas ou lei do setor.",
            "Este instrumento, juntamente aos eventuais anexos que o integram, constituem o inteiro teor do acordo entre as partes e substitui todas as outras comunicações, inclusive a proposta inicial, com relação ao objeto do presente Contrato;",
            "Qualquer alteração do presente Contrato ou modificação das condições aqui acordadas deverão ser realizadas por escrito e assinada por ambas as partes;",
            "Existindo conflito entre as condições deste Contrato e seus anexos, prevalecerão as condições deste Contrato;",
            "As cláusulas deste Contrato deverão ser interpretadas com base nos princípios de probidade e boa-fé;",
            "Em caso de qualquer disposição deste Contrato ser declarada nula ou ineficaz, as disposições remanescentes permanecerão em vigor, sem sofrer qualquer prejuízo em razão da declaração de nulidade ou ineficácia;",
            "Nada neste Contrato deverá conceder a qualquer das partes o direito de assumir compromissos, de qualquer tipo, em nome da outra parte, sendo cada parte uma organização independente e sem relação de agência, representação ou parceria;",
            "O presente Contrato é celebrado em caráter irrevogável e irretratável, obrigando não só as partes, como também seus herdeiros legais sucessores;",
            "As partes não poderão ceder ou transferir os direitos relativos a este contrato sem o prévio e expresso consentimento escrito da outra parte;",
            "A tolerância de quaisquer das partes em relação a eventuais infrações contratuais praticadas pela outra não importará em modificação, novação ou renúncia a qualquer direito;",
            "Ocorrendo qualquer alteração no endereço eletrônico ou postal, obrigar-se-á o (a) respectivo (a) CONTRATANTE a informar imediatamente à parte CONTRATADA, sob pena de permanecer válida, para os fins ora previstos, a comunicação enviada ao endereço anterior;",
            "Aplica-se, ao presente contrato, o disposto no Artigo 784, III, do Código de Processo Civil Brasileiro, haja vista o caráter de título executivo extrajudicial do presente instrumento."
          ]
        }
      ]
    },
    {
      "id": "sec_clausula_decima_terceira",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA DÉCIMA TERCEIRA – DA RESCISÃO: O presente Contrato poderá ser rescindido por justa causa (resolução contratual), mediante notificação escrita, considerando-se como infração contratual, além das demais previstas neste instrumento, as seguintes hipóteses:" },
        {
          "type": "list_alpha",
          "items": [
            "Recuperação judicial, falência, dissolução amigável ou judicial, liquidação judicial ou extrajudicial, por quaisquer das partes;",
            "Violação de qualquer obrigação oriunda de lei ou deste contrato, não sanada no prazo de 20 (vinte) dias contados da notificação promovida nesse sentido, quando for possível seu saneamento;",
            "Violação do dever de sigilo ou confidencialidade por qualquer das partes;",
            "Se o CONTRATANTE ou a CONTRATADA utilizar, de forma inadequada, a marca, nome, sinal distintivo, logotipo ou timbre da outra parte, em quaisquer documentos, matérias publicitários ou meios de divulgação, tais como internet, redes sociais, televisão, rádio, impresso ou quaisquer outras mídias, bem como realizar o registro de nomes e domínios na internet que possam gerar conflitos com a marca da parte contraria;",
            "Suspensão, pelas autoridades competentes, da execução do objeto do Contrato, em decorrência de violação de dispositivos legais vigentes;",
            "O presente Contrato será rescindido (resolução unilateral) sem necessidade de notificação caso a parte CONTRATANTE não arque com as obrigações de pagamento pactuadas;"
          ]
        },
        { "type": "text", "content": "<strong>Parágrafo Primeiro:</strong> As partes estabelecem que o presente contrato poderá ser rescindido de forma unilateral (resilição unilateral), porém, caso tal evento ocorra, a parte que lhe der causa restará obrigada ao pagamento da respectiva cláusula penal no montante equivalente em 50% (cinquenta por cento) do valor do contrato;", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Segundo:</strong> Em caso de rescisão por justa causa (resolução unilateral), a parte que der causa deverá ressarcir a prejudicada em eventuais perdas e danos, pagamento dos ônus sucumbenciais, custas e honorários advocatícios, acrescido da multa no valor de 20% (vinte por cento) sobre o valor do contrato, sem prejuízo das demais cláusulas penais.", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Terceiro:</strong> Em caso de desistência pelo (a) CONTRATANTE, sem justo motivo, antes de iniciada a instalação, será devido à CONTRATADA multa no percentual de 30% (trinta por cento) sobre o valor dos serviços contratados;", "mt": True },
        { "type": "text", "content": "<strong>Parágrafo Quarto:</strong> Em caso de desistência pelo(a) CONTRATANTE, sem justo motivo, durante ou quando já concluída a instalação, será devido à CONTRATADA multa no percentual de 80% (oitenta por cento) sobre o valor dos serviços contratados.", "mt": True }
      ]
    },
    {
      "id": "sec_clausula_decima_quarta",
      "title": "",
      "blocks": [
        { "type": "text_highlight", "content": "CLÁUSULA DÉCIMA QUARTA – DO FORO: Fica eleito o foro de NATAL/RN para dirimir quaisquer dúvidas oriundas deste instrumento, renunciando as partes a qualquer outro, por mais privilegiado que seja, correndo por conta da parte vencida, em caso de decisão judicial, todas as custas que o processo ocasionar, inclusive honorários advocatícios de 20% (vinte por cento) sobre o valor da causa." },
        { "type": "text", "content": "E, por estarem justas e contratadas, as partes assinam este contrato, em 02 (duas) vias de igual teor e forma, juntamente com as testemunhas abaixo.", "mt": True },
        { "type": "text", "content": "Natal/RN, {{date_day}} de {{date_month}} de 2025.", "mt": True },
        {
          "type": "signatures",
          "party_1_name": "{{client_name}}",
          "party_1_doc": "CPF: {{client_cpf}}",
          "party_1_role": "CONTRATANTE",
          "party_2_name": "SOLAR SOL ENERGIA RENOVÁVEIS LTDA",
          "party_2_doc": "CNPJ: 42.518.541/0001-56",
          "party_2_role": "CONTRATADA – Representante legal",
          "witnesses": True
        }
      ]
    }
  ]
}

template, created = ContractTemplate.objects.get_or_create(
    name="Modelo Fiel V3 - Réplica Contrato.pdf",
    defaults={
        "category": "Energia Solar",
        "description": "Réplica exata de 15 páginas do documento @contrato.pdf sem resumos.",
        "content": template_content,
        "is_active": True
    }
)

if not created:
    template.content = template_content
    template.save()

print("Modelo Fiel V3 criado com sucesso!")
