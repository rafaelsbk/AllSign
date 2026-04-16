from django.contrib.auth.models import AbstractUser
from django.db import models

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome do Cargo")

    def __str__(self):
        return self.name

class User(AbstractUser):
    role = models.ForeignKey(
        Role, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name="Cargo"
    )
    is_employee = models.BooleanField(default=False, verbose_name="É Funcionário")

    def __str__(self):
        role_name = self.role.name if self.role else "Sem cargo"
        return f"{self.username} ({role_name})"

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
    rg = models.CharField(max_length=20, unique=True, null=True, blank=True)
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

class Company(models.Model):
    legal_name = models.CharField(max_length=255, verbose_name="Razão Social")
    trading_name = models.CharField(max_length=255, verbose_name="Nome Fantasia")
    cnpj = models.CharField(max_length=18, unique=True, verbose_name="CNPJ")
    email = models.EmailField(verbose_name="E-mail")
    cep = models.CharField(max_length=9)
    state = models.CharField(max_length=2, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    neighborhood = models.CharField(max_length=100, null=True, blank=True)
    street = models.CharField(max_length=255, null=True, blank=True)
    number = models.CharField(max_length=20, null=True, blank=True)
    complement = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.trading_name} ({self.cnpj})"

class CompanyPhone(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='phones')
    phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.phone} (Company: {self.company.trading_name})"

class Professional(models.Model):
    class Profession(models.TextChoices):
        ENGINEER = "ENGINEER", "Engenheiro (a)"
        ARCHITECT = "ARCHITECT", "Arquiteto (a)"

    name = models.CharField(max_length=255, verbose_name="Nome")
    crea_number = models.CharField(max_length=50, unique=True, verbose_name="CREA/CAU")
    email = models.EmailField(verbose_name="E-mail")
    profession = models.CharField(
        max_length=20, 
        choices=Profession.choices, 
        default=Profession.ENGINEER
    )
    cep = models.CharField(max_length=9)
    state = models.CharField(max_length=2, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    neighborhood = models.CharField(max_length=100, null=True, blank=True)
    street = models.CharField(max_length=255, null=True, blank=True)
    number = models.CharField(max_length=20, null=True, blank=True)
    complement = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.crea_number})"

class ProfessionalPhone(models.Model):
    professional = models.ForeignKey(Professional, on_delete=models.CASCADE, related_name='phones')
    phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.phone} (Professional: {self.professional.name})"

class Contract(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='contracts')
    contract_number = models.CharField(max_length=50, default="XXX")

    # Qualificação extra
    nationality = models.CharField(max_length=100, default="Brasileiro (a)")
    marital_status = models.CharField(max_length=50, default="SOLTEIRO (A)")

    # Valores
    service_value = models.FloatField()
    service_value_extenso = models.CharField(max_length=255, blank=True)
    equipment_value = models.FloatField()
    equipment_value_extenso = models.CharField(max_length=255, blank=True)

    # Detalhes técnicos
    validity = models.CharField(max_length=50, default="12 (DOZE) MESES")
    inverter_brand = models.CharField(max_length=255)
    inverter_quantity = models.IntegerField()
    inverter_k = models.CharField(max_length=50, default="XX")
    inverter_warranty = models.CharField(max_length=50, default="10")

    panels_brand = models.CharField(max_length=255)
    panels_quantity = models.IntegerField()
    panels_watts = models.CharField(max_length=50, default="XXX")
    panels_warranty = models.CharField(max_length=50, default="25")

    # Pagamento e Prazos
    due_date = models.CharField(max_length=500) 
    payment_method = models.CharField(max_length=500)
    beneficiary_units = models.CharField(max_length=500)

    contract_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Contrato {self.id} - {self.client.name} ({self.contract_date})"
