from rest_framework import serializers
from .models import User, Client

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

class ClientSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Client
        fields = ('id', 'name', 'email', 'phone', 'cpf', 'cep', 'seller', 'seller_name', 'created_at')
        read_only_fields = ('seller', 'created_at')
