# Database Package

PostgreSQL database migrations and schema for Personal Finance Tracker.

## Setup

1. Create a PostgreSQL database (locally or using a cloud provider like Supabase, Neon, or Railway)

2. Copy the `.env.example` file to `.env` and update with your database connection string:
```bash
cp .env.example .env
```

3. Run migrations:
```bash
npm run migrate
```

## Migrations

Migrations are SQL files in the `migrations/` directory. They are executed in alphabetical order.

### Current Migrations

- `001_create_assets_table.sql` - Creates the assets table with constraints and indexes

### Creating New Migrations

To create a new migration, add a new SQL file with a sequential number prefix:
```
002_add_new_feature.sql
```

## Database Schema

### Assets Table

Stores both Fixed Deposits and Savings Accounts with type-specific validation.

**Columns:**
- `id` - UUID primary key
- `type` - Asset type ('fixed-deposit' or 'savings-account')
- `bank_name` - Name of the financial institution
- `account_number` - Account number (optional for FD, required for Savings)
- `principal_amount` - FD principal (required for FD)
- `interest_rate` - Annual interest rate percentage
- `start_date` - FD start date (required for FD)
- `maturity_date` - FD maturity date (required for FD)
- `current_balance` - Savings account balance (required for Savings)
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update (auto-updated)

**Constraints:**
- Type-specific field requirements
- Positive amounts validation
- Interest rate range (0-100)
- Maturity date must be after start date for FDs

**Indexes:**
- `idx_assets_type` - For filtering by asset type
- `idx_assets_bank_name` - For filtering by bank
- `idx_assets_maturity_date` - For FD maturity queries

## Connection

The database connection uses the `DATABASE_URL` environment variable in PostgreSQL connection string format:

```
postgresql://username:password@host:port/database
```

## Cloud Providers

### Supabase
1. Create a project at https://supabase.com
2. Get the connection string from Settings > Database
3. Use the "Connection pooling" string for better performance

### Neon
1. Create a project at https://neon.tech
2. Get the connection string from the dashboard
3. Use the pooled connection string

### Railway
1. Create a project at https://railway.app
2. Add a PostgreSQL service
3. Get the connection string from the service variables
