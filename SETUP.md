# Personal Finance Tracker - Setup Guide

This guide will help you set up the Personal Finance Tracker monorepo from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **PostgreSQL** 14 or higher (or a cloud database account)

Check your versions:
```bash
node --version
npm --version
psql --version
```

## Quick Start

### 1. Install Dependencies

From the root directory, install all dependencies for all packages:

```bash
cd personal-finance-tracker
npm install
```

This will install dependencies for the root workspace and all sub-packages (frontend, backend, database, shared).

### 2. Set Up Environment Variables

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and configure:
- `DATABASE_URL` - Your PostgreSQL connection string
- `PORT` - Backend server port (default: 3000)
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:5173)

#### Frontend Environment
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env` and configure:
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000/api)

#### Database Environment
```bash
cd ../database
cp .env.example .env
```

Edit `database/.env` and configure:
- `DATABASE_URL` - Your PostgreSQL connection string (same as backend)

### 3. Set Up PostgreSQL Database

You have three options:

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
```bash
createdb personal_finance_tracker
```
3. Update `DATABASE_URL` in `.env` files:
```
DATABASE_URL=postgresql://username:password@localhost:5432/personal_finance_tracker
```

#### Option B: Supabase (Recommended for beginners)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Settings > Database
4. Copy the "Connection pooling" connection string
5. Update `DATABASE_URL` in `.env` files with the connection string

#### Option C: Neon

1. Go to https://neon.tech and create a free account
2. Create a new project
3. Copy the connection string from the dashboard
4. Update `DATABASE_URL` in `.env` files with the connection string

### 4. Run Database Migrations

```bash
cd database
npm run migrate
```

You should see output like:
```
Connected to database
Found 1 migration files
▶️  Running 001_create_assets_table.sql...
✅ Completed 001_create_assets_table.sql
✨ All migrations completed successfully!
```

### 5. Build Shared Package

The shared package contains TypeScript types used by both frontend and backend:

```bash
cd ../shared
npm run build
```

### 6. Start Development Servers

You need to run both the backend and frontend servers.

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
📊 Environment: development
🔗 CORS enabled for: http://localhost:5173
```

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 7. Verify Setup

1. Open your browser and go to http://localhost:5173
2. You should see the Personal Finance Tracker welcome page
3. Check the backend health endpoint: http://localhost:3000/health

## Alternative: Run Both Servers Concurrently

From the root directory:
```bash
npm run dev
```

This will start both backend and frontend servers simultaneously.

## Running Tests

### Test All Packages
```bash
npm test
```

### Test Specific Package
```bash
npm run test:frontend
npm run test:backend
```

### Test with Coverage
```bash
cd frontend
npm run test:coverage

cd ../backend
npm run test:coverage
```

## Project Structure

```
personal-finance-tracker/
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   └── tests/
│   └── package.json
├── backend/            # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   └── middleware/
│   └── package.json
├── database/           # PostgreSQL migrations
│   ├── migrations/
│   └── package.json
├── shared/             # Shared TypeScript types
│   ├── src/
│   └── package.json
└── package.json        # Root workspace config
```

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
- Ensure PostgreSQL is running
- Check that `DATABASE_URL` is correct
- Verify firewall settings

**Error: "Database does not exist"**
- Create the database: `createdb personal_finance_tracker`
- Or use a cloud provider (Supabase/Neon)

### Port Already in Use

**Backend port 3000 in use:**
```bash
# Change PORT in backend/.env
PORT=3001
```

**Frontend port 5173 in use:**
```bash
# Vite will automatically try the next available port
# Or specify a different port in vite.config.ts
```

### Module Not Found Errors

**Error: "Cannot find module '@personal-finance-tracker/shared'"**
```bash
# Rebuild the shared package
cd shared
npm run build
```

### CORS Errors

**Error: "CORS policy blocked"**
- Ensure `CORS_ORIGIN` in backend/.env matches your frontend URL
- Restart the backend server after changing .env

## Next Steps

Now that your environment is set up, you can:

1. Start implementing features according to the tasks in `.kiro/specs/personal-finance-tracker/tasks.md`
2. Run tests as you develop: `npm test`
3. Check the design document for architecture details
4. Review the requirements document for feature specifications

## Development Workflow

1. **Make changes** to code
2. **Run tests** to verify correctness
3. **Check linting** with `npm run lint`
4. **Build** for production with `npm run build`
5. **Commit** your changes

## Useful Commands

```bash
# Install all dependencies
npm install

# Start both servers
npm run dev

# Run all tests
npm test

# Build all packages
npm run build

# Lint all packages
npm run lint

# Run database migrations
npm run migrate
```

## Getting Help

- Check the README.md in each package directory
- Review the spec files in `.kiro/specs/personal-finance-tracker/`
- Consult the design document for architecture details
- Check the requirements document for feature specifications

Happy coding! 🚀
