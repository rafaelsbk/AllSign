import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Client
from users.serializers import ContractSerializer

# Busca o cliente (ID 1 ou o primeiro disponível)
client = Client.objects.filter(id=1).first() or Client.objects.first()

if not client:
    print("ERRO: Nenhum cliente encontrado no banco de dados para realizar o teste.")
else:
    # Dados de exemplo conforme solicitação
    data = {
      "client": client.id,
      "contract_number": "TEST-001",
      "service_value": 0,
      "equipment_value": 0,
      "contract_date": "2026-04-22",
      "extra_data": {"final_html": "<h1>Teste</h1>"}
    }

    print(f"--- Teste de Validação do ContractSerializer ---")
    print(f"Client ID utilizado: {client.id} ({client.name})")
    print(f"Dados enviados: {json.dumps(data, indent=2, ensure_ascii=False)}")
    print("-" * 50)

    serializer = ContractSerializer(data=data)
    
    if serializer.is_valid():
        print("RESULTADO: O serializer é VÁLIDO!")
        # Para evitar problemas de serialização de objetos no print, mostramos apenas as chaves
        print(f"Campos validados: {list(serializer.validated_data.keys())}")
        
        try:
            contract = serializer.save()
            print(f"SUCESSO: Contrato criado com ID {contract.id}")
        except Exception as e:
            print(f"ERRO AO SALVAR NO BANCO: {str(e)}")
    else:
        print("RESULTADO: O serializer é INVÁLIDO!")
        print("ERROS ENCONTRADOS:")
        print(json.dumps(serializer.errors, indent=2, ensure_ascii=False))
