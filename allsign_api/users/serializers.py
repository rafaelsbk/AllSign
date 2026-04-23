from rest_framework import serializers
from .models import User, Client, ClientPhone, Contract, ContractTemplate, Company, CompanyPhone, Professional, ProfessionalPhone, LetterheadTemplate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        if user.role:
            token['role'] = user.role.name
        else:
            token['role'] = None
        return token

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role')
        )
        return user

class ClientPhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientPhone
        fields = ('id', 'phone')

class ClientSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    phones = ClientPhoneSerializer(many=True, required=False)
    cpf = serializers.CharField(
        validators=[UniqueValidator(queryset=Client.objects.all())]
    )
    rg = serializers.CharField(
        validators=[UniqueValidator(queryset=Client.objects.all())],
        required=False,
        allow_null=True,
        allow_blank=True
    )

    class Meta:
        model = Client
        fields = (
            'id', 'name', 'email', 'phones', 'cpf', 'rg', 'birth_date', 
            'marital_status', 'education_level', 'cep', 'state', 'city',
            'neighborhood', 'street', 'number', 'complement',
            'seller', 'seller_name', 'is_active', 'created_at'
        )
        read_only_fields = ('seller', 'created_at')

    def validate_rg(self, value):
        if value:
            numbers_only = ''.join(filter(str.isdigit, value))
            if len(numbers_only) > 11:
                raise serializers.ValidationError("O RG deve conter no máximo 11 números.")
        return value

    def create(self, validated_data):
        phones_data = validated_data.pop('phones', [])
        client = Client.objects.create(**validated_data)
        for phone_data in phones_data:
            ClientPhone.objects.create(client=client, **phone_data)
        return client

    def update(self, instance, validated_data):
        phones_data = validated_data.pop('phones', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if phones_data is not None:
            instance.phones.all().delete()
            for phone_data in phones_data:
                ClientPhone.objects.create(client=instance, **phone_data)
        return instance

class ContractSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = Contract
        fields = '__all__'
        extra_kwargs = {
            'contract_date': {'required': False, 'allow_null': True},
            'service_value': {'required': False, 'allow_null': True},
            'equipment_value': {'required': False, 'allow_null': True},
            'contract_number': {'required': False},
        }

class LetterheadTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LetterheadTemplate
        fields = '__all__'

class CompanyPhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyPhone
        fields = ('id', 'phone')

class CompanySerializer(serializers.ModelSerializer):
    phones = CompanyPhoneSerializer(many=True, required=False)

    class Meta:
        model = Company
        fields = '__all__'

    def create(self, validated_data):
        phones_data = validated_data.pop('phones', [])
        company = Company.objects.create(**validated_data)
        for phone_data in phones_data:
            CompanyPhone.objects.create(company=company, **phone_data)
        return company

    def update(self, instance, validated_data):
        phones_data = validated_data.pop('phones', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if phones_data is not None:
            instance.phones.all().delete()
            for phone_data in phones_data:
                CompanyPhone.objects.create(company=instance, **phone_data)
        return instance

class ProfessionalPhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalPhone
        fields = ('id', 'phone')

class ProfessionalSerializer(serializers.ModelSerializer):
    phones = ProfessionalPhoneSerializer(many=True, required=False)

    class Meta:
        model = Professional
        fields = '__all__'

    def create(self, validated_data):
        phones_data = validated_data.pop('phones', [])
        professional = Professional.objects.create(**validated_data)
        for phone_data in phones_data:
            ProfessionalPhone.objects.create(professional=professional, **phone_data)
        return professional

    def update(self, instance, validated_data):
        phones_data = validated_data.pop('phones', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if phones_data is not None:
            instance.phones.all().delete()
            for phone_data in phones_data:
                ProfessionalPhone.objects.create(professional=instance, **phone_data)
        return instance

class ContractTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractTemplate
        fields = '__all__'
