from rest_framework import serializers
from .models import User, Client, ClientPhone, Contract, Role, Company, CompanyPhone, Professional, ProfessionalPhone
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role.name if user.role else None
        return token

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class EmployeeSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source='role', write_only=True
    )
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'role', 'role_id', 'is_active', 'is_employee']
        read_only_fields = ['is_employee']

    def create(self, validated_data):
        # Define is_employee como True para todos os usuários criados por este serializer
        validated_data['is_employee'] = True
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class ClientPhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientPhone
        fields = ['id', 'phone']

class ClientSerializer(serializers.ModelSerializer):
    phones = ClientPhoneSerializer(many=True)
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)

    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('seller',)

    def create(self, validated_data):
        phones_data = validated_data.pop('phones')
        client = Client.objects.create(**validated_data)
        for phone_data in phones_data:
            ClientPhone.objects.create(client=client, **phone_data)
        return client

    def update(self, instance, validated_data):
        phones_data = validated_data.pop('phones', None)
        
        # Atualiza os campos do cliente
        instance = super().update(instance, validated_data)

        # Atualiza os telefones
        if phones_data is not None:
            # Pega os IDs dos telefones existentes
            existing_phone_ids = {p.id for p in instance.phones.all()}
            
            # Itera sobre os dados dos telefones recebidos
            current_phone_ids = set()
            for phone_data in phones_data:
                phone_id = phone_data.get('id', None)
                if phone_id:
                    # Atualiza telefone existente
                    phone = ClientPhone.objects.get(id=phone_id, client=instance)
                    phone.phone = phone_data.get('phone', phone.phone)
                    phone.save()
                    current_phone_ids.add(phone_id)
                else:
                    # Cria novo telefone
                    new_phone = ClientPhone.objects.create(client=instance, **phone_data)
                    current_phone_ids.add(new_phone.id)
            
            # Remove telefones que não foram enviados na atualização
            phones_to_delete = existing_phone_ids - current_phone_ids
            ClientPhone.objects.filter(id__in=phones_to_delete).delete()
        
        return instance

class ContractSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = Contract
        fields = '__all__'

class CompanyPhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyPhone
        fields = ['id', 'phone']

class CompanySerializer(serializers.ModelSerializer):
    phones = CompanyPhoneSerializer(many=True)

    class Meta:
        model = Company
        fields = '__all__'

    def create(self, validated_data):
        phones_data = validated_data.pop('phones')
        company = Company.objects.create(**validated_data)
        for phone_data in phones_data:
            CompanyPhone.objects.create(company=company, **phone_data)
        return company

    def update(self, instance, validated_data):
        phones_data = validated_data.pop('phones', None)
        instance = super().update(instance, validated_data)
        if phones_data is not None:
            existing_phone_ids = {p.id for p in instance.phones.all()}
            current_phone_ids = set()
            for phone_data in phones_data:
                phone_id = phone_data.get('id', None)
                if phone_id:
                    phone = CompanyPhone.objects.get(id=phone_id, company=instance)
                    phone.phone = phone_data.get('phone', phone.phone)
                    phone.save()
                    current_phone_ids.add(phone_id)
                else:
                    new_phone = CompanyPhone.objects.create(company=instance, **phone_data)
                    current_phone_ids.add(new_phone.id)
            phones_to_delete = existing_phone_ids - current_phone_ids
            CompanyPhone.objects.filter(id__in=phones_to_delete).delete()
        return instance

class ProfessionalPhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalPhone
        fields = ['id', 'phone']

class ProfessionalSerializer(serializers.ModelSerializer):
    phones = ProfessionalPhoneSerializer(many=True)

    class Meta:
        model = Professional
        fields = '__all__'

    def create(self, validated_data):
        phones_data = validated_data.pop('phones')
        professional = Professional.objects.create(**validated_data)
        for phone_data in phones_data:
            ProfessionalPhone.objects.create(professional=professional, **phone_data)
        return professional

    def update(self, instance, validated_data):
        phones_data = validated_data.pop('phones', None)
        instance = super().update(instance, validated_data)
        if phones_data is not None:
            existing_phone_ids = {p.id for p in instance.phones.all()}
            current_phone_ids = set()
            for phone_data in phones_data:
                phone_id = phone_data.get('id', None)
                if phone_id:
                    phone = ProfessionalPhone.objects.get(id=phone_id, professional=instance)
                    phone.phone = phone_data.get('phone', phone.phone)
                    phone.save()
                    current_phone_ids.add(phone_id)
                else:
                    new_phone = ProfessionalPhone.objects.create(professional=instance, **phone_data)
                    current_phone_ids.add(new_phone.id)
            phones_to_delete = existing_phone_ids - current_phone_ids
            ProfessionalPhone.objects.filter(id__in=phones_to_delete).delete()
        return instance
