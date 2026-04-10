from rest_framework import serializers
from .models import User, Client, ClientPhone

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
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
            role=validated_data.get('role', User.Role.USER)
        )
        return user

class ClientPhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientPhone
        fields = ('id', 'phone')

from rest_framework.validators import UniqueValidator

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
            # Remove caracteres não numéricos para contagem
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
        
        # Atualiza os campos do cliente
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Atualiza os telefones (substitui os antigos pelos novos para simplificar)
        if phones_data is not None:
            instance.phones.all().delete()
            for phone_data in phones_data:
                ClientPhone.objects.create(client=instance, **phone_data)
        
        return instance
