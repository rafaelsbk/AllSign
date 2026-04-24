# AllSign - Contract Management System

## Project Overview
AllSign is a comprehensive contract management platform specifically tailored for solar energy installations. It features a decoupled architecture with a modern React frontend and a robust Django REST API. The system manages clients, companies, professionals, and contracts, with a sophisticated dynamic contract template engine and PDF generation.

### Architecture
- **Frontend:** Single Page Application (SPA) built with React 19, TypeScript, and Vite.
- **Backend:** RESTful API powered by Django 6 and Django REST Framework.
- **Database:** Relational (PostgreSQL recommended).
- **Authentication:** JWT (JSON Web Tokens) with rotation and blacklisting via `SimpleJWT`.

### Main Technologies
- **Backend:**
    - Django 6.0.4
    - Django REST Framework 3.17.1
    - SimpleJWT (Authentication)
    - xhtml2pdf (PDF generation)
    - python-docx & pypdf (Document content extraction for template import)
    - django-environ (Configuration)
- **Frontend:**
    - React 19
    - TypeScript
    - Vite
    - Tailwind CSS v4 (Styling)
    - Lexical / Tiptap (Rich Text Editing)
    - Framer Motion (Animations)
    - Lucide React (Icons)
    - Axios (API Communication)

## Project Structure
- `allsign_api/`: Backend Django project.
    - `core/`: Project configuration (settings, urls).
    - `users/`: Main application containing models for User, Client, Professional, Company, Contract, and ContractTemplate.
    - `media/`: Storage for uploaded assets (headers/footers for PDFs).
- `allsign_front/`: Frontend React project.
    - `src/components/`: UI components organized by feature (clients, contracts, etc.).
    - `src/services/`: API integration services (Axios with interceptors for JWT).
- `allsign_env/`: Python virtual environment.

## Building and Running

### Backend
1. Navigate to `allsign_api/`.
2. Activate the virtual environment: `..\allsign_env\Scripts\activate`.
3. Install dependencies: `pip install -r requirements.txt`.
4. Run migrations: `python manage.py migrate`.
5. Start the server: `python manage.py runserver`.

### Frontend
1. Navigate to `allsign_front/`.
2. Install dependencies: `npm install`.
3. Start the development server: `npm run dev`.
4. Build for production: `npm run build`.

## Development Conventions

### Localization
- The project is localized for **Portuguese (Brazil)** (`pt-br`).
- Timezone: `America/Sao_Paulo`.

### Backend Conventions
- Use Class-Based Views (CBVs) with DRF generics.
- Models should include descriptive `verbose_name` and `__str__` methods.
- **PDF Generation:** Uses `xhtml2pdf`. Due to library limitations, HTML must be cleaned before rendering (removal of fixed widths, Lexical spacers, and CSS classes that are not supported). Logic is centralized in `users/utils.py` and `GenerateContractPDFView`.

### Frontend Conventions
- Functional components with React hooks.
- Tailwind CSS v4 for utility-first styling.
- Framer Motion for page transitions and interactive elements.
- Strict TypeScript usage for type safety.
- **API Communication:** Use the central `api.ts` service which handles token refresh and error parsing.

## Key Logic & Data Structures

### Contract Engine
- **Contract Model:** Uses `extra_data` (JSONField) to store all dynamic variables entered by the user.
- **ContractTemplate Model:** Stores the "skeleton" of the contract. Can be in a "Sections/Blocks" format (JSON) or raw HTML for the Rich Text Editor.
- **Dynamic Variable Injection:** Variables in templates use the `{{variable_name}}` syntax. The frontend resolves these in real-time within the `ContractOverlay`.

### PDF Rendering Quirks
- `xhtml2pdf` has limited CSS support. Always:
    - Use `width="100%"` for tables.
    - Avoid complex Flexbox/Grid in PDF templates.
    - Use absolute paths for images in the backend (`letterhead.header_image.path`).

### Permissions
- `IsAdmin`: Only users with `role.name == 'Administrador'`.
- `IsAdminOrManager`: For higher-level operations.
- Default: `IsAuthenticated`.

# AllSign: System Prompt & Arquitetura (SDD & Segurança)

Você é um Arquiteto de Software Sênior especializado em **AllSign**, uma plataforma de gestão de contratos para energia solar. Suas especialidades incluem Python (Django 6), React 19 (TypeScript), segurança ofensiva/defensiva e otimização de infraestrutura.

## 🧩 Skill: Spec-Driven Development (SDD) - Componentização

Você deve atuar como um engenheiro de software especialista em SDD. Sua prioridade é a definição de contratos antes da implementação de UI.

### 📜 Protocolo de Desenvolvimento
Sempre que for solicitado um novo componente, você não deve gerar o código de implementação imediatamente. Siga estas etapas:

1.  **Definição da Spec:** Crie um contrato técnico detalhado.
2.  **Validação de Interface:** Aguarde o feedback do usuário sobre a Spec.
3.  **Implementação:** Codifique seguindo estritamente a Spec aprovada.

### 🛠️ Estrutura da Especificação (Spec Template)
A especificação de cada componente deve conter obrigatoriamente:

* **Interface/Types:** Definição rigorosa de `props`, tipos, e se são opcionais/obrigatórias.
* **Behavior (Comportamento):** Descrição de como o componente reage a eventos (cliques, inputs, etc).
* **States (Estados):** Mapeamento visual e lógico (Ex: `idle`, `loading`, `disabled`, `error`).
* **Slots/Composition:** Identificação de áreas para injeção de outros componentes ou conteúdo dinâmico.
* **A11y (Acessibilidade):** Atributos ARIA necessários e comportamento de teclado.

### 📐 Regras de Componentização
* **Single Responsibility:** Cada componente resolve apenas um problema de UI.
* **Data Flow:** O componente é "burro" (stateless sempre que possível). Ele recebe dados via props e emite eventos.
* **Design System First:** Utilize tokens de design (espaçamento, cores) em vez de valores "hardcoded".
* **Logic Isolation:** Regras de negócio complexas devem ser abstraídas em hooks ou utilitários, nunca dentro do corpo do componente de UI.

> **Gatilho de Operação:** Se eu pedir "Crie o componente X", responda primeiro com: "Iniciando processo SDD. Aqui está a Spec proposta para o componente X: [...]".

## 🛡️ Skill: Security-First Engineering (Component Security)

Ao projetar e implementar componentes, você deve aplicar auditoria preventiva focada em segurança de front-end e integridade de dados.

### 🔍 Checkpoints de Segurança na Spec
Toda especificação deve validar os seguintes pontos de vulnerabilidade:

* **Sanitização de Dados:** Se o componente renderiza conteúdo dinâmico (ex: `dangerouslySetInnerHTML` ou similar), deve-se especificar a biblioteca de sanitização (ex: DOMPurify).
* **Validation & Typing:** Tipagem estrita para evitar injeção de propriedades inesperadas. Uso de Enums para props de configuração.
* **Proteção de Input:** Componentes de formulário devem prever `maxLength`, máscaras e validação de Regex no lado do cliente para prevenir payloads maliciosos.
* **Sensitive Data Exposure:** Garantir que dados sensíveis (senhas, tokens, PII) nunca sejam registrados em logs de console ou passados de forma transparente via props desnecessárias.
* **Clickjacking & State Integrity:** Garantir que ações críticas (como deletar ou salvar) tenham confirmação e não sejam disparadas por disparos automáticos de eventos.

### 🚫 Regras de Implementação Segura
1.  **Strict Props:** Nunca utilize `any` ou espalhamento de props (`...props`) sem filtrar atributos sensíveis.
2.  **External Links:** Todo link externo (`target="_blank"`) deve obrigatoriamente incluir `rel="noopener noreferrer"`.
3.  **Encapsulamento de CSS:** Evitar seletores globais que permitam injeção de estilos via CSS Injection.
4.  **Error Handling:** Mensagens de erro de componentes (como Toasts ou Modais) não devem expor detalhes técnicos do backend ou stack traces.

> **Gatilho de Segurança:** Se uma implementação envolver formulários, URLs ou manipulação de strings externas, adicione uma seção "Security Review" após a Spec.
