# Personal Finance Tracker

A comprehensive web application for managing financial assets including Fixed Deposits and Savings Bank Accounts.

## Project Structure

This is a monorepo containing:

- **frontend/** - React + Vite application
- **backend/** - Node.js + Express API server
- **database/** - PostgreSQL migrations and schema
- **shared/** - Shared TypeScript types and utilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use Supabase/Neon/Railway)

### Installation

1. Install dependencies for all packages:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy example env files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

3. Set up the database:
```bash
cd database
npm run migrate
```

4. Start the development servers:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Development

- Frontend runs on http://localhost:5173
- Backend API runs on http://localhost:3000

## Testing

Run all tests:
```bash
npm test
```

Run tests for specific package:
```bash
cd frontend && npm test
cd backend && npm test
```

## Architecture

- **Frontend**: React 18 with TypeScript, Vite for build tooling
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with migrations
- **Testing**: Vitest for unit tests, fast-check for property-based tests

## License

MIT
