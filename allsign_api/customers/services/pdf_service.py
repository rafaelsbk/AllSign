from jinja2 import Template
from weasyprint import HTML
from io import BytesIO
from django.utils import timezone

def gerar_pdf_contrato(cliente, contrato_modelo):
    """
    Gera um PDF baseado em um modelo de contrato (HTML) e os dados do cliente.
    """
    # Contexto para o template Jinja2
    contexto = {
        'cliente': cliente,
        'telefones': cliente.telefones.all(),
        'data_atual': timezone.now().strftime('%d/%m/%Y'),
    }

    # Renderiza o template HTML usando Jinja2
    template = Template(contrato_modelo.conteudo_html)
    html_renderizado = template.render(contexto)

    # Gera o PDF usando WeasyPrint
    pdf_buffer = BytesIO()
    HTML(string=html_renderizado).write_pdf(target=pdf_buffer)
    
    pdf_buffer.seek(0)
    return pdf_buffer
