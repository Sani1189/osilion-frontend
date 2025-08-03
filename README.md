# Osilion X Production Platform

A real-time aerospace production tracking platform built with modern web technologies, featuring role-based access control, WebSocket real-time updates, and comprehensive production management capabilities.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Local Development Setup

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd osilion-production-frontend
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. **Environment Configuration**
Create a `.env.local` file in the root directory:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
\`\`\`

4. **Start the development server**
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

5. **Access the application**
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts

The application includes pre-configured demo accounts for testing different roles:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Product Manager | pm@osilion.com | password123 | Full CRUD on Products & Projects, Read Items |
| Project Manager | proj@osilion.com | password123 | Full CRUD on Projects, Read Products & Items |
| Engineer | eng@osilion.com | password123 | Full CRUD on Items, Read Products & Projects |

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.16 | React framework with App Router |
| **React** | 18+ | UI library with hooks and context |
| **TypeScript** | 5+ | Type safety and developer experience |
| **Tailwind CSS** | 3.4+ | Utility-first CSS framework |
| **shadcn/ui** | Latest | Modern component library |
| **Framer Motion** | 10.16+ | Animation and transitions |

### State Management & Data Fetching

| Technology | Purpose |
|------------|---------|
| **TanStack Query** | Server state management and caching |
| **React Hook Form** | Form state management and validation |
| **Zod** | Schema validation |
| **React Context** | Global state (auth, notifications, themes) |

### Real-time & Communication

| Technology | Purpose |
|------------|---------|
| **Socket.IO Client** | WebSocket real-time communication |
| **Custom WebSocket Hook** | Connection management and event handling |

### UI/UX Libraries

| Technology | Purpose |
|------------|---------|
| **Radix UI** | Accessible component primitives |
| **Lucide React** | Icon library |
| **Recharts** | Data visualization and charts |
| **date-fns** | Date manipulation and formatting |
| **next-themes** | Dark/light theme management |

### Development Tools

| Technology | Purpose |
|------------|---------|
| **ESLint** | Code linting and quality |
| **Prettier** | Code formatting |
| **TypeScript** | Static type checking |

## 🏗️ System Architecture

### High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT TIER                              │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (Port 3000)                              │
│  ├── App Router (RSC + Client Components)                  │
│  ├── Authentication & Authorization                        │
│  ├── Real-time WebSocket Connection                        │
│  ├── State Management (TanStack Query + Context)           │
│  └── Responsive UI (Tailwind + shadcn/ui)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVER TIER                               │
├─────────────────────────────────────────────────────────────┤
│  Backend API Server (Port 3001)                            │
│  ├── RESTful API Endpoints                                 │
│  ├── WebSocket Server (Socket.IO)                          │
│  ├── Authentication Middleware                             │
│  ├── Role-based Access Control                             │
│  └── Business Logic Layer                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Database Queries
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA TIER                                │
├─────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL/MySQL/SQLite)                        │
│  ├── Users & Authentication                                │
│  ├── Products & Specifications                             │
│  ├── Projects & Timelines                                  │
│  ├── Items & Production Status                             │
│  └── Audit Logs & History                                  │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Frontend Architecture

\`\`\`
src/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Authenticated routes
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── products/            # Product management
│   │   ├── projects/            # Project management
│   │   ├── items/               # Item tracking
│   │   └── layout.tsx           # App layout wrapper
│   ├── login/                   # Authentication
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── layout/                  # Layout components
│   ├── dashboard/               # Dashboard-specific
│   ├── products/                # Product components
│   ├── projects/                # Project components
│   └── items/                   # Item components
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts             # Authentication
│   ├── use-websocket.ts        # WebSocket connection
│   ├── use-notifications.ts    # Real-time notifications
│   └── use-color-scheme.ts     # Theme management
├── lib/                        # Utilities and configuration
│   ├── api.ts                  # API client and endpoints
│   ├── permissions.ts          # Role-based access control
│   └── utils.ts                # Helper functions
└── types/                      # TypeScript type definitions
\`\`\`

## 📊 Database Schema (ERD)

```mermaid
erDiagram
    USERS {
        string id PK
        string name
        string email UK
        string password_hash
        enum role
        datetime created_at
        datetime updated_at
    }

    PRODUCTS {
        string id PK
        string name
        string version
        text description
        decimal price
        string created_by_id FK
        datetime created_at
        datetime updated_at
    }

    PROJECTS {
        string id PK
        string name
        text description
        date start_date
        date deadline
        string product_id FK
        string created_by_id FK
        datetime created_at
        datetime updated_at
    }

    ITEMS {
        string id PK
        string serial_number UK
        enum status
        string project_id FK
        string created_by_id FK
        datetime created_at
        datetime updated_at
    }

    AUDIT_LOGS {
        string id PK
        string entity_type
        string entity_id
        string action
        json old_values
        json new_values
        string user_id FK
        datetime created_at
    }

    USERS ||--o{ PRODUCTS : creates
    USERS ||--o{ PROJECTS : creates
    USERS ||--o{ ITEMS : creates
    USERS ||--o{ AUDIT_LOGS : performs
    
    PRODUCTS ||--o{ PROJECTS : "used in"
    PROJECTS ||--o{ ITEMS : contains
    
    PRODUCTS ||--o{ AUDIT_LOGS : "audit trail"
    PROJECTS ||--o{ AUDIT_LOGS : "audit trail"
    ITEMS ||--o{ AUDIT_LOGS : "audit trail"
