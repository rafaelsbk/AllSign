from django.db import models

class Cliente(models.Model):
    class EstadoCivil(models.TextChoices):
        SOLTEIRO = "SOLTEIRO", "Solteiro(a)"
        CASADO = "CASADO", "Casado(a)"
        DIVORCIADO = "DIVORCIADO", "Divorciado(a)"
        VIUVO = "VIUVO", "Viúvo(a)"
        UNIAO_ESTAVEL = "UNIAO_ESTAVEL", "União Estável"

    # Dados Pessoais
    nome_completo = models.CharField("Nome Completo", max_length=255)
    cpf_cnpj = models.CharField("CPF/CNPJ", max_length=18, unique=True)
    rg = models.CharField("RG", max_length=20, blank=True, null=True)
    data_nascimento = models.DateField("Data de Nascimento", blank=True, null=True)
    email = models.EmailField("E-mail", max_length=255)
    profissao = models.CharField("Profissão", max_length=100, blank=True, null=True)
    estado_civil = models.CharField(
        "Estado Civil",
        max_length=20,
        choices=EstadoCivil.choices,
        default=EstadoCivil.SOLTEIRO
    )

    # Endereço
    logradouro = models.CharField("Logradouro", max_length=255)
    numero = models.CharField("Número", max_length=10)
    complemento = models.CharField("Complemento", max_length=100, blank=True, null=True)
    bairro = models.CharField("Bairro", max_length=100)
    cidade = models.CharField("Cidade", max_length=100)
    estado = models.CharField("Estado", max_length=2)  # Sigla (ex: SP, RJ)
    cep = models.CharField("CEP", max_length=9)

    # Metadados
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ["nome_completo"]

    def __str__(self):
        return f"{self.nome_completo} ({self.cpf_cnpj})"


class Telefone(models.Model):
    class TipoTelefone(models.TextChoices):
        FIXO = "FIXO", "Fixo"
        CELULAR = "CELULAR", "Celular"
        WHATSAPP = "WHATSAPP", "WhatsApp"

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name="telefones",
        verbose_name="Cliente"
    )
    numero = models.CharField("Número", max_length=20)
    tipo = models.CharField(
        "Tipo",
        max_length=20,
        choices=TipoTelefone.choices,
        default=TipoTelefone.CELULAR
    )

    class Meta:
        verbose_name = "Telefone"
        verbose_name_plural = "Telefones"

    def __str__(self):
        return f"{self.numero} ({self.tipo})"


class Contrato(models.Model):
    titulo = models.CharField("Título do Contrato", max_length=255)
    slug = models.SlugField("Identificador (Slug)", unique=True)
    conteudo_html = models.TextField(
        "Conteúdo HTML (Template Jinja2)",
        help_text="Use tags Jinja2 como {{ cliente.nome_completo }} para os dados."
    )
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Modelo de Contrato"
        verbose_name_plural = "Modelos de Contratos"

    def __str__(self):
        return self.titulo
