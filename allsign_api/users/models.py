from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        MANAGER = "MANAGER", "Manager"
        USER = "USER", "User"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER
    )

    def __str__(self):
        return f"{self.username} ({self.role})"

class Client(models.Model):
    class MaritalStatus(models.TextChoices):
        SOLTEIRO = "SOLTEIRO", "Solteiro(a)"
        CASADO = "CASADO", "Casado(a)"
        DIVORCIADO = "DIVORCIADO", "Divorciado(a)"
        VIUVO = "VIUVO", "Viúvo(a)"
        OUTRO = "OUTRO", "Outro"

    class EducationLevel(models.TextChoices):
        FUNDAMENTAL = "FUNDAMENTAL", "Ensino Fundamental"
        MEDIO = "MEDIO", "Ensino Médio"
        SUPERIOR = "SUPERIOR", "Ensino Superior"

    name = models.CharField(max_length=255)
    email = models.EmailField()
    cpf = models.CharField(max_length=18, unique=True) # Suporta CPF e CNPJ com máscara
    rg = models.CharField(max_length=20, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    marital_status = models.CharField(
        max_length=20, 
        choices=MaritalStatus.choices, 
        default=MaritalStatus.SOLTEIRO,
        null=True, blank=True
    )
    education_level = models.CharField(
        max_length=20, 
        choices=EducationLevel.choices, 
        default=EducationLevel.MEDIO,
        null=True, blank=True
    )
    cep = models.CharField(max_length=9)
    state = models.CharField(max_length=2, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    neighborhood = models.CharField(max_length=100, null=True, blank=True)
    street = models.CharField(max_length=255, null=True, blank=True)
    number = models.CharField(max_length=20, null=True, blank=True)
    complement = models.CharField(max_length=255, null=True, blank=True)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.cpf})"

class ClientPhone(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='phones')
    phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.phone} (Client: {self.client.name})"
