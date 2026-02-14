# Project Structure Overview

This document provides a complete overview of the Personal Finance Tracker monorepo structure.

## Monorepo Layout

```
personal-finance-tracker/
├── README.md                    # Main project documentation
├── SETUP.md                     # Detailed setup instructions
├── STRUCTURE.md                 # This file - structure overview
├── package.json                 # Root workspace configuration
├── .gitignore                   # Git ignore rules
│
├── frontend/                    # React + Vite Application
│   ├── src/
│   │   ├── main.tsx            # Application entry point
│   │   ├── App.tsx             # Main App component
│   │   ├── App.css             # App styles
│   │   ├── index.css           # Global styles
│   │   ├── vite-env.d.ts       # Vite type definitions
│   │   ├── components/         # React components (to be added)
│   │   ├── hooks/              # Custom React hooks (to be added)
│   │   ├── services/           # API client (to be added)
│   │   ├── utils/              # Utility functions (to be added)
│   │   └── tests/
│   │       └── setup.ts        # Test configuration
│   ├── index.html              # HTML entry point
│   ├── package.json            # Frontend dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── tsconfig.node.json      # Node TypeScript config
│   ├── vite.config.ts          # Vite configuration
│   ├── .eslintrc.cjs           # ESLint configuration
│   ├── .env.example            # Environment variables template
│   └── README.md               # Frontend documentation
│
├── backend/                     # Node.js + Express API Server
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── routes/             # API route handlers (to be added)
│   │   ├── controllers/        # Business logic (to be added)
│   │   ├── models/             # Data models & validation (to be added)
│   │   ├── services/           # Database services (to be added)
│   │   ├── middleware/         # Custom middleware (to be added)
│   │   └── utils/              # Utility functions (to be added)
│   ├── package.json            # Backend dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── vitest.config.ts        # Vitest configuration
│   ├── .eslintrc.json          # ESLint configuration
│   ├── .env.example            # Environment variables template
│   └── README.md               # Backend documentation
│
├── database/                    # PostgreSQL Migrations
│   ├── migrations/
│   │   ├── 001_create_assets_table.sql  # Initial schema
│   │   └── run-migrations.js            # Migration runner
│   ├── package.json            # Database dependencies
│   ├── .env.example            # Environment variables template
│   └── README.md               # Database documentation
│
└── shared/                      # Shared TypeScript Types
    ├── src/
    │   ├── index.ts            # Module exports
    │   └── types.ts            # Shared type definitions
    ├── package.json            # Shared package config
    └── tsconfig.json           # TypeScript config
```

## Package Details

### Root Package (`personal-finance-tracker/`)

**Purpose:** Workspace orchestration and monorepo management

**Key Files:**
- `package.json` - Defines workspaces and root-level scripts
- `.gitignore` - Git ignore patterns for all packages
- `README.md` - Main project documentation
- `SETUP.md` - Detailed setup guide

**Scripts:**
- `npm run dev` - Start both frontend and backend servers
- `npm test` - Run tests in all packages
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages

### Frontend Package (`frontend/`)

**Purpose:** React-based user interface

**Technology Stack:**
- React 18.2.0
- Vite 5.0.11 (build tool)
- TypeScript 5.3.3
- Vitest 1.1.0 (testing)
- fast-check 3.15.0 (property-based testing)
- React Testing Library 14.1.2
- Axios 1.6.5 (HTTP client)

**Key Features:**
- Component-based architecture
- Custom hooks for state management
- API client for backend communication
- Responsive design (mobile-first)
- Property-based testing support

**Port:** 5173 (development)

### Backend Package (`backend/`)

**Purpose:** REST API server and business logic

**Technology Stack:**
- Node.js with Express 4.18.2
- TypeScript 5.3.3
- PostgreSQL with pg 8.11.3
- Vitest 1.1.0 (testing)
- fast-check 3.15.0 (property-based testing)
- Helmet 7.1.0 (security)
- Morgan 1.10.0 (logging)
- CORS 2.8.5

**Key Features:**
- RESTful API endpoints
- PostgreSQL database integration
- Request validation
- Error handling middleware
- CORS support
- Security headers

**Port:** 3000 (development)

**API Endpoints (to be implemented):**
- `POST /api/assets` - Create asset
- `GET /api/assets` - Get all assets
- `GET /api/assets/:id` - Get asset by ID
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/assets/stats` - Get dashboard statistics

### Database Package (`database/`)

**Purpose:** PostgreSQL schema and migrations

**Technology Stack:**
- PostgreSQL 14+
- pg 8.11.3 (PostgreSQL client)
- Node.js migration runner

**Key Features:**
- SQL migration files
- Migration tracking table
- Automatic migration execution
- Transaction support for migrations

**Schema:**
- `assets` table - Stores Fixed Deposits and Savings Accounts
- `migrations` table - Tracks executed migrations

**Indexes:**
- `idx_assets_type` - Asset type filtering
- `idx_assets_bank_name` - Bank name filtering
- `idx_assets_maturity_date` - Maturity date queries

### Shared Package (`shared/`)

**Purpose:** Shared TypeScript types and utilities

**Technology Stack:**
- TypeScript 5.3.3

**Exports:**
- `Asset`, `FixedDeposit`, `SavingsAccount` - Asset type definitions
- `AssetFilters` - Filter type definitions
- `ValidationResult`, `ValidationError` - Validation types
- `ApiResponse` - API response wrapper
- `DashboardStats` - Dashboard statistics type
- `AssetInput` - Asset creation/update input type

**Usage:**
```typescript
import { Asset, FixedDeposit, ApiResponse } from '@personal-finance-tracker/shared';
```

## Configuration Files

### TypeScript Configuration

**Frontend (`frontend/tsconfig.json`):**
- Target: ES2020
- Module: ESNext (for Vite)
- JSX: react-jsx
- Strict mode enabled

**Backend (`backend/tsconfig.json`):**
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Source maps enabled

**Shared (`shared/tsconfig.json`):**
- Target: ES2020
- Module: CommonJS
- Declaration files generated

### Testing Configuration

**Frontend (`frontend/vite.config.ts`):**
- Test environment: jsdom (browser simulation)
- Globals enabled
- Coverage with v8 provider

**Backend (`backend/vitest.config.ts`):**
- Test environment: node
- Globals enabled
- Coverage with v8 provider

### Linting Configuration

**Frontend (`.eslintrc.cjs`):**
- React hooks rules
- React refresh rules
- TypeScript recommended rules

**Backend (`.eslintrc.json`):**
- Node.js environment
- TypeScript recommended rules

## Environment Variables

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3000/api
VITE_ENV=development
```

### Backend (`.env`)
```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host:port/dbname
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

### Database (`.env`)
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

## Development Workflow

1. **Install dependencies:** `npm install` (from root)
2. **Set up environment:** Copy `.env.example` files
3. **Run migrations:** `npm run migrate` (from database/)
4. **Build shared package:** `npm run build` (from shared/)
5. **Start backend:** `npm run dev` (from backend/)
6. **Start frontend:** `npm run dev` (from frontend/)
7. **Run tests:** `npm test` (from any package)

## Build Process

### Development Build
```bash
# Start both servers with hot reload
npm run dev
```

### Production Build
```bash
# Build all packages
npm run build

# Outputs:
# - frontend/dist/ - Static files for deployment
# - backend/dist/ - Compiled JavaScript
# - shared/dist/ - Compiled types
```

## Testing Strategy

### Unit Tests
- Test specific functions and components
- Use concrete examples
- Test error conditions

### Property-Based Tests
- Test universal properties
- Use fast-check generators
- Minimum 100 iterations per test
- Reference design document properties

### Integration Tests
- Test complete workflows
- Test API endpoints
- Test database operations

## Dependencies Summary

### Production Dependencies
- **Frontend:** react, react-dom, axios, @personal-finance-tracker/shared
- **Backend:** express, cors, pg, helmet, morgan, dotenv, @personal-finance-tracker/shared
- **Database:** pg, dotenv
- **Shared:** (none - types only)

### Development Dependencies
- **Testing:** vitest, fast-check, @testing-library/react, @testing-library/jest-dom
- **Build:** typescript, vite, @vitejs/plugin-react, tsx
- **Linting:** eslint, @typescript-eslint/eslint-plugin, @typescript-eslint/parser
- **Types:** @types/node, @types/express, @types/react, @types/pg

## Next Steps

1. **Task 2:** Implement database schema and migrations (already done)
2. **Task 3:** Implement asset data models and validation
3. **Task 4:** Implement calculation functions
4. **Task 5:** Checkpoint - Ensure all model tests pass
5. **Task 6:** Implement backend API endpoints
6. Continue with remaining tasks...

## Notes

- All packages use TypeScript for type safety
- Monorepo uses npm workspaces for dependency management
- Shared package must be built before backend/frontend can use it
- Database migrations run in order by filename
- Tests use Vitest for fast execution
- Property-based tests use fast-check library
- Frontend uses Vite for fast development and building
- Backend uses tsx for TypeScript execution in development
