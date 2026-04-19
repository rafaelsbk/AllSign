# AllSign - Contract Management System

AllSign é uma plataforma especializada para empresas de energia solar gerenciarem clientes, parceiros (empresas e profissionais) e gerarem contratos detalhados de serviços e equipamentos.



# Regra Mandatória: Protocolo Spec-Driven Development (SDD) em 3 Etapas

Sempre que eu solicitar a criação, atualização ou integração de qualquer entidade do sistema (como Contratos, Inversores, Painéis Solares, Empresas, Profissionais, Clientes ou Documentos) ou componentes de UI/Endpoints, você está estritamente proibido de gerar código de implementação imediatamente.

Você deve executar o trabalho obrigatoriamente nestas 3 etapas sequenciais:

## Etapa 1: Definição da Interface e Especificação (Spec)
Gere um documento técnico descrevendo o contrato da funcionalidade. A Spec deve conter:
* **Backend (Django):** Rota do endpoint alvo, método HTTP, modelo de dados afetado, permissões necessárias (JWT) e a estrutura exata do JSON de Request e Response esperada.
* **Frontend (React/TypeScript):** Interfaces e Types estritos, propriedades do componente (props), gerenciamento de estado esperado (loading, error, success, idle) e mapeamento da chamada Axios.
* **Regras de Segurança e Negócio:** Sanitização, validações de payload e regras específicas do domínio.
* **Ação:** Após detalhar a Spec, pare a geração de texto.

## Etapa 2: Validação (Pausa Obrigatória)
Finalize sua resposta perguntando explicitamente: "A especificação desta interface está aprovada ou deseja ajustar algum tipo/rota?". 
Aguarde a minha resposta. Não prossiga para a escrita de código funcional sob nenhuma circunstância sem a minha aprovação explícita.

## Etapa 3: Implementação
Apenas após eu responder com a aprovação da Spec, escreva o código final em Python e TypeScript. O código gerado deve respeitar rigorosamente as interfaces, rotas e payloads definidos e aprovados na Etapa 1.

## Repositório e Tecnologias

- **Backend:** Python 3.x com **Django** e **Django REST Framework (DRF)**.
- **Frontend:** **React** (v19) com **TypeScript**, **Vite** e **Tailwind CSS**.
- **Autenticação:** JWT utilizando `rest_framework_simplejwt`.
- **Geração de Documentos:** PDF dinâmico via templates HTML no backend e processamento de arquivos `.docx` / `.pdf` para criação de modelos.

## 🏗️ Arquitetura e Endpoints

A API está organizada sob o prefixo `/api/` e utiliza autenticação Bearer Token para a maioria das operações.

### Autenticação e Usuários
- `POST /api/token/`: Geração de tokens de acesso e refresh.
- `POST /api/token/refresh/`: Atualização do token de acesso.
- `POST /api/users/register/`: Cadastro de novos usuários/vendedores.
- `GET/PUT/PATCH /api/users/profile/`: Gestão do perfil do usuário autenticado.

### Gestão de Clientes
- `GET/POST /api/users/clients/`: Listagem e criação de clientes. Filtros por `name`, `cpf` e `only_mine`.
- `GET/PUT/PATCH/DELETE /api/users/clients/<id>/`: Operações em cliente específico. *Delete restrito a administradores.*

### Contratos e Geração de PDF
- `GET/POST /api/users/contracts/`: Listagem e criação de contratos vinculados a clientes.
- `GET/PUT/PATCH/DELETE /api/users/contracts/<id>/`: Gestão de contrato individual.
- `POST /api/users/contracts/generate-pdf/`: Motor de renderização de PDF (suporta seções dinâmicas).

### Modelos Jurídicos (Templates)
- `GET/POST /api/users/templates/`: Listagem e criação de modelos estruturados (JSON).
- `POST /api/users/templates/upload/`: Upload de `.docx` ou `.pdf` para extração automática de texto e criação de blocos de template.
- `GET/PUT/PATCH/DELETE /api/users/templates/<id>/`: Gestão de modelos existentes.

### Parceiros e Técnicos
- `GET/POST /api/users/companies/`: Gestão de empresas parceiras.
- `GET/POST /api/users/professionals/`: Gestão de profissionais (Engenheiros/Arquitetos) com registro CREA/CAU.

## 📊 Modelos de Dados

Estrutura principal das entidades do sistema no Django:

### Usuários e Permissões
- **User:** Extensão do `AbstractUser`. Inclui `role` (FK para Role) e `is_employee`.
- **Role:** Definição de cargos e níveis de acesso.

### Entidades de Cadastro
- **Client:** Dados de qualificação civil (CPF/RG, estado civil, escolaridade) e endereço completo. Vinculado a um `seller` (User).
- **Company:** Cadastro de empresas com Razão Social, Nome Fantasia e CNPJ.
- **Professional:** Cadastro técnico com `crea_number` e tipo de profissão (Engenheiro/Arquiteto).
- **ClientPhone / CompanyPhone / ProfessionalPhone:** Entidades para suporte a múltiplos telefones por cadastro.

### Operacional e Documentos
- **Contract:** Registro técnico de vendas solar. Contém especificações de Inversores (marca, kW, garantia), Painéis (quantidade, watts, garantia), valores financeiros, métodos de pagamento e datas de vencimento.
- **ContractTemplate:** Armazena a estrutura de "seções" e "blocos" (parágrafo, título, lista, assinaturas) em formato JSON para montagem dinâmica de contratos.

## 🧩 Skill: Spec-Driven Development (SDD) - Componentização

Você deve atuar como um engenheiro de software especialista em SDD. Sua prioridade é a definição de contratos antes da implementação de UI.

### 📜 Protocolo de Desenvolvimento
Sempre que for solicitado um novo componente, não gere o código imediatamente:
1. **Definição da Spec:** Crie um contrato técnico (Interface/Types, Comportamento, Estados, Acessibilidade).
2. **Validação:** Aguarde aprovação da Spec.
3. **Implementação:** Codifique seguindo estritamente a Spec aprovada.

### 🛡️ Skill: Security-First Engineering
- **Sanitização:** Validação rigorosa de inputs e sanitização de conteúdo dinâmico.
- **Strict Props:** Tipagem estrita em TypeScript, evitando `any`.
- **Proteção de Dados:** Garantir que PII (CPF, RG) seja manipulado com segurança e nunca exposto desnecessariamente.

---
*Nota: Este arquivo é a fonte da verdade para o Gemini CLI sobre a estrutura do projeto AllSign.*
 # Regra Mandatória: Protocolo Spec-Driven Development (SDD) em 3 Etapas

Sempre que eu solicitar a criação, atualização ou integração de qualquer entidade do sistema (como Contratos, Inversores, Painéis Solares, Empresas, Profissionais, Clientes ou Documentos) ou componentes de UI/Endpoints, você está estritamente proibido de gerar código de implementação imediatamente.

Você deve executar o trabalho obrigatoriamente nestas 3 etapas sequenciais:

## Etapa 1: Definição da Interface e Especificação (Spec)
Gere um documento técnico descrevendo o contrato da funcionalidade. A Spec deve conter:
* **Backend (Django):** Rota do endpoint alvo, método HTTP, modelo de dados afetado, permissões necessárias (JWT) e a estrutura exata do JSON de Request e Response esperada.
* **Frontend (React/TypeScript):** Interfaces e Types estritos, propriedades do componente (props), gerenciamento de estado esperado (loading, error, success, idle) e mapeamento da chamada Axios.
* **Regras de Segurança e Negócio:** Sanitização, validações de payload e regras específicas do domínio.
* **Ação:** Após detalhar a Spec, pare a geração de texto.

## Etapa 2: Validação (Pausa Obrigatória)
Finalize sua resposta perguntando explicitamente: "A especificação desta interface está aprovada ou deseja ajustar algum tipo/rota?". 
Aguarde a minha resposta. Não prossiga para a escrita de código funcional sob nenhuma circunstância sem a minha aprovação explícita.

## Etapa 3: Implementação
