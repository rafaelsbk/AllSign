from django.contrib import admin
from .models import Cliente, Telefone, Contrato

class TelefoneInline(admin.TabularInline):
    model = Telefone
    extra = 1

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("nome_completo", "cpf_cnpj", "email", "cidade", "estado")
    search_fields = ("nome_completo", "cpf_cnpj", "email")
    list_filter = ("estado", "estado_civil")
    inlines = [TelefoneInline]
    
    fieldsets = (
        ("Dados Pessoais", {
            "fields": (
                "nome_completo", "cpf_cnpj", "rg", "data_nascimento", 
                "email", "profissao", "estado_civil"
            )
        }),
        ("Endereço", {
            "fields": (
                "logradouro", "numero", "complemento", 
                "bairro", "cidade", "estado", "cep"
            )
        }),
        ("Metadados", {
            "fields": ("criado_em", "atualizado_em"),
            "classes": ("collapse",)
        }),
    )
    readonly_fields = ("criado_em", "atualizado_em")

@admin.register(Telefone)
class TelefoneAdmin(admin.ModelAdmin):
    list_display = ("numero", "tipo", "cliente")
    list_filter = ("tipo",)
    search_fields = ("numero", "cliente__nome_completo")


@admin.register(Contrato)
class ContratoAdmin(admin.ModelAdmin):
    list_display = ("titulo", "slug", "criado_em")
    prepopulated_fields = {"slug": ("titulo",)}
    search_fields = ("titulo", "slug")
