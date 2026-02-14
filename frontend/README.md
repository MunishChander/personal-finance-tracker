# Frontend Application

React + Vite frontend for Personal Finance Tracker.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The application will run on http://localhost:5173

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint code

## Project Structure

```
src/
├── main.tsx              # Application entry point
├── App.tsx               # Main App component
├── components/           # React components
│   ├── Dashboard.tsx
│   ├── AssetForm.tsx
│   ├── AssetList.tsx
│   ├── AssetCard.tsx
│   └── FilterPanel.tsx
├── hooks/                # Custom React hooks
│   ├── useAssets.ts
│   └── useFilters.ts
├── services/             # API client and services
│   └── api.ts
├── utils/                # Utility functions
│   ├── validation.ts
│   └── calculations.ts
├── tests/                # Test files
│   ├── setup.ts
│   ├── unit/
│   └── property/
└── styles/               # CSS files
```

## Features

- **Asset Management**: Add, edit, and delete Fixed Deposits and Savings Accounts
- **Dashboard**: View portfolio summary and statistics
- **Filtering**: Filter assets by type and bank
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Real-time Updates**: Dashboard updates immediately after changes

## Testing

Tests use Vitest, React Testing Library, and fast-check for property-based testing.

### Unit Tests
Test specific components and functions with concrete examples.

### Property-Based Tests
Test universal properties across all inputs using fast-check.

Run tests:
```bash
npm test
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000/api)
- `VITE_ENV` - Environment (development/production)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

Preview the production build:
```bash
npm run preview
```
