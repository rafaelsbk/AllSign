# AllSign - Contract Management System

AllSign is a specialized platform designed for solar energy companies to manage clients, partners (companies and professionals), and generate detailed service and equipment contracts.

## Project Overview

- **Purpose:** Streamline the lifecycle of solar energy contracts, from lead management (Clients) to technical specifications (Inverters, Panels) and document generation.
- **Backend:** Python 3.x with **Django** and **Django REST Framework (DRF)**.
- **Frontend:** **React** (v19) with **TypeScript**, **Vite**, and **Tailwind CSS**.
- **Authentication:** JWT-based authentication using `rest_framework_simplejwt`.
- **Key Features:**
    - Management of Clients, Companies, and Professionals (Engineers/Architects).
    - Detailed Contract modeling including solar equipment specs (Inverters, Panels).
    - PDF generation capabilities (via `jspdf` and `html2canvas` on the frontend).
    - Multi-role user system (Employees/Sellers).

## Repository Structure

```text
AllSign/
├── allsign_api/          # Django Backend
│   ├── core/             # Project settings and configuration
│   └── users/            # Main application (Models, Views, Serializers)
├── allsign_front/        # React Frontend
│   ├── src/
│   │   ├── components/   # UI and Domain components
│   │   ├── services/     # API integration (axios)
│   │   └── assets/       # Static assets
├── allsign_env/          # Python Virtual Environment (local)
└── allsign_docs/         # Project documentation and notes
```

## Setup and Running

### Backend (allsign_api)
1. **Environment:** Ensure the virtual environment is active.
   ```powershell
   .\allsign_env\Scripts\activate
   ```
2. **Environment Variables:** Create a `.env` file in `allsign_api/` based on settings.
   - Required: `SECRET_KEY`, `DEBUG`, `DATABASE_URL` (or DB settings).
3. **Database:**
   ```bash
   python manage.py migrate
   ```
4. **Run Server:**
   ```bash
   python manage.py runserver
   ```
   *The API will be available at `http://localhost:8000/api/`*

### Frontend (allsign_front)
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Run Development Server:**
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173/`*

## Development Conventions

### Backend
- **Locale:** The project uses `pt-br` for field names, verbose names, and messages.
- **Custom User:** Uses a custom User model (`users.User`) extending `AbstractUser`.
- **API Response:** Standard DRF JSON responses.
- **Auth:** Bearer tokens are required for most endpoints.

### Frontend
- **Styling:** Tailwind CSS with a focus on modern, clean UI.
- **Animations:** Framer Motion for interactive transitions.
- **Icons:** Lucide React.
- **API Client:** Axios instance located in `src/services/api.ts` with automatic token refresh logic.
- **Language:** UI labels and components are in Portuguese (Brazil).

## Key Files
- `allsign_api/users/models.py`: Defines the core domain (Client, Professional, Contract, etc.).
- `allsign_front/src/services/api.ts`: Centralized API configuration and interceptors.
- `allsign_front/src/App.tsx`: Main routing logic.
- `allsign_api/core/settings.py`: Backend configuration and CORS settings.
