# Backend API Server

Node.js + Express backend for Personal Finance Tracker.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Make sure the database is set up and migrations are run (see `../database/README.md`)

4. Start the development server:
```bash
npm run dev
```

The server will run on http://localhost:3000

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint code

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Assets (to be implemented)
- `POST /api/assets` - Create new asset
- `GET /api/assets` - Get all assets
- `GET /api/assets/:id` - Get asset by ID
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/assets/stats` - Get dashboard statistics

## Project Structure

```
src/
├── index.ts              # Server entry point
├── routes/               # API route handlers
├── controllers/          # Business logic
├── models/               # Data models and validation
├── services/             # Database and external services
├── middleware/           # Custom middleware
└── utils/                # Utility functions
```

## Testing

Tests use Vitest and fast-check for property-based testing.

Run tests:
```bash
npm test
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:5173)
- `LOG_LEVEL` - Logging level (default: info)
