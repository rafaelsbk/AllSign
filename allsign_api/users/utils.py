from io import BytesIO
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from django.core.files.base import ContentFile
import os
import re

def render_to_pdf(template_src, context_dict={}):
    template = get_template(template_src)
    html  = template.render(context_dict)
    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type='application/pdf')
    return None

def save_contract_pdf(contract_instance, html_content, letterhead=None):
    """
    Gera e salva o PDF do contrato no sistema de arquivos.
    """
    from .models import LetterheadTemplate
    
    # Limpeza rigorosa para o xhtml2pdf (mesma lógica da view)
    html_content = re.sub(r'<div[^>]*class="lexical-spacer"[^>]*>.*?</div>', '', html_content, flags=re.DOTALL)
    html_content = re.sub(r'width:\s*\d+px;?', '', html_content)
    html_content = re.sub(r'width="\d+"', '', html_content)
    html_content = html_content.replace('<table', '<table width="100%" border="1" cellspacing="0" cellpadding="4"')
    
    data = {
        'html_content': html_content,
        'client_name': contract_instance.client.name,
        'contract_number': contract_instance.contract_number,
    }

    if letterhead:
        if letterhead.header_image:
            data['header_image_path'] = letterhead.header_image.path
        if letterhead.footer_image:
            data['footer_image_path'] = letterhead.footer_image.path
        
        data['header_margin_percent'] = letterhead.header_margin_percent
        data['footer_margin_percent'] = letterhead.footer_margin_percent

    # Determinar qual template usar
    template_src = 'users/contrato_pdf.html'
    if 'sections' in contract_instance.extra_data:
        template_src = 'users/contrato_dinamico_pdf.html'

    template = get_template(template_src)
    html = template.render(data)
    result = BytesIO()
    
    pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
    
    if not pdf.err:
        filename = f"Contrato_{contract_instance.id}_{contract_instance.client.name.replace(' ', '_')}.pdf"
        contract_instance.pdf_file.save(filename, ContentFile(result.getvalue()), save=False)
        return True
    return False
