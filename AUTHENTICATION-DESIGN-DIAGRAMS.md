# Authentication System - Design Diagrams

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [OAuth Login Flow - Sequence Diagram](#2-oauth-login-flow---sequence-diagram)
3. [User Sync Flow - Sequence Diagram](#3-user-sync-flow---sequence-diagram)
4. [Protected API Request Flow](#4-protected-api-request-flow)
5. [Component Architecture](#5-component-architecture)
6. [Database Schema](#6-database-schema)
7. [State Management](#7-state-management)
8. [Error Handling Flow](#8-error-handling-flow)

---

## 1. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Login Page                             │ │
│  │  - OAuth Buttons (Google/GitHub)                           │ │
│  │  - Theme Toggle                                            │ │
│  │  - Error/Success Messages                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Auth Context                              │ │
│  │  - User State                                              │ │
│  │  - Session State                                           │ │
│  │  - signInWithGoogle()                                      │ │
│  │  - signInWithGithub()                                      │ │
│  │  - signOut()                                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                 Supabase Client                             │ │
│  │  - auth.signInWithOAuth()                                  │ │
│  │  - auth.getSession()                                       │ │
│  │  - auth.signOut()                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JWT Token
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE AUTH                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  OAuth Providers                            │ │
│  │  - Google OAuth 2.0                                        │ │
│  │  - GitHub OAuth                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  JWT Management                             │ │
│  │  - Token Generation                                        │ │
│  │  - Token Verification                                      │ │
│  │  - Token Refresh                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JWT Token in Header
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express)                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Auth Middleware                                │ │
│  │  - Extract JWT from Authorization header                   │ │
│  │  - Verify JWT with Supabase                                │ │
│  │  - Extract user_id from JWT payload                        │ │
│  │  - Attach user to req.user                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              User Controller                                │ │
│  │  - POST /api/auth/sync (sync user to DB)                   │ │
│  │  - GET /api/auth/me (get current user)                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Assets Controller                                │ │
│  │  - All endpoints filter by req.user.id                     │ │
│  │  - GET /api/assets?user_id=xxx                             │ │
│  │  - POST /api/assets (with user_id)                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL/Neon)                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  users                                                      │ │
│  │  - id (UUID, PK)                                           │ │
│  │  - email                                                   │ │
│  │  - name                                                    │ │
│  │  - avatar_url                                              │ │
│  │  - provider (google/github)                                │ │
│  │  - provider_id                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  assets                                                     │ │
│  │  - id (UUID, PK)                                           │ │
│  │  - user_id (UUID, FK → users.id)                          │ │
│  │  - type                                                    │ │
│  │  - ... (asset-specific fields)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. OAuth Login Flow - Sequence Diagram

### Google OAuth Flow

```
User          LoginPage      AuthContext    Supabase      Google       Backend        Database
 │                │              │             │            │             │              │
 │  Click Google │              │             │            │             │              │
 │  Button       │              │             │            │             │              │
 │──────────────>│              │             │            │             │              │
 │               │              │             │            │             │              │
 │               │ signInWith   │             │            │             │              │
 │               │ Google()     │             │            │             │              │
 │               │─────────────>│             │            │             │              │
 │               │              │             │            │             │              │
 │               │              │ auth.signIn │            │             │              │
 │               │              │ WithOAuth() │            │             │              │
 │               │              │────────────>│            │             │              │
 │               │              │             │            │             │              │
 │               │              │             │ Redirect   │             │              │
 │               │              │             │ to Google  │             │              │
 │               │              │             │───────────>│             │              │
 │               │              │             │            │             │              │
 │  Redirected to Google OAuth Screen         │            │             │              │
 │<───────────────────────────────────────────────────────│             │              │
 │               │              │             │            │             │              │
 │  Enter credentials & authorize              │            │             │              │
 │────────────────────────────────────────────────────────>│             │              │
 │               │              │             │            │             │              │
 │               │              │             │  Auth Code │             │              │
 │               │              │             │<───────────│             │              │
 │               │              │             │            │             │              │
 │               │              │             │ Exchange   │             │              │
 │               │              │             │ for Token  │             │              │
 │               │              │             │───────────>│             │              │
 │               │              │             │            │             │              │
 │               │              │             │ Access     │             │              │
 │               │              │             │ Token      │             │              │
 │               │              │             │<───────────│             │              │
 │               │              │             │            │             │              │
 │               │              │  Generate   │            │             │              │
 │               │              │  JWT Token  │            │             │              │
 │               │              │<────────────│            │             │              │
 │               │              │             │            │             │              │
 │  Redirect back with JWT in URL fragment    │            │             │              │
 │<───────────────────────────────────────────│            │             │              │
 │               │              │             │            │             │              │
 │               │  Extract JWT │             │            │             │              │
 │               │  from URL    │             │            │             │              │
 │               │─────────────>│             │            │             │              │
 │               │              │             │            │             │              │
 │               │              │ Store in    │            │             │              │
 │               │              │ Auth State  │            │             │              │
 │               │              │             │            │             │              │
 │               │              │ POST /api/  │            │             │              │
 │               │              │ auth/sync   │            │             │              │
 │               │              │────────────────────────────────────────>│              │
 │               │              │             │            │             │              │
 │               │              │             │            │             │ INSERT/      │
 │               │              │             │            │             │ UPDATE user  │
 │               │              │             │            │             │─────────────>│
 │               │              │             │            │             │              │
 │               │              │             │            │             │ User Record  │
 │               │              │             │            │             │<─────────────│
 │               │              │             │            │             │              │
 │               │              │  User Data  │            │             │              │
 │               │              │<────────────────────────────────────────│              │
 │               │              │             │            │             │              │
 │               │  Redirect to │             │            │             │              │
 │               │  Dashboard   │             │            │             │              │
 │<──────────────│              │             │            │             │              │
 │               │              │             │            │             │              │
```

---

## 3. User Sync Flow - Sequence Diagram

### Syncing Supabase User to Local Database

```
Frontend      AuthContext    Backend API    Supabase     Database
   │              │              │             │            │
   │  After OAuth │              │             │            │
   │  Success     │              │             │            │
   │──────────────>│              │             │            │
   │              │              │             │            │
   │              │ POST /api/   │             │            │
   │              │ auth/sync    │             │            │
   │              │ {            │             │            │
   │              │   email,     │             │            │
   │              │   name,      │             │            │
   │              │   avatar,    │             │            │
   │              │   provider   │             │            │
   │              │ }            │             │            │
   │              │─────────────>│             │            │
   │              │              │             │            │
   │              │              │ Verify JWT  │            │
   │              │              │────────────>│            │
   │              │              │             │            │
   │              │              │ JWT Valid   │            │
   │              │              │<────────────│            │
   │              │              │             │            │
   │              │              │ Extract     │            │
   │              │              │ user_id     │            │
   │              │              │ from JWT    │            │
   │              │              │             │            │
   │              │              │ SELECT *    │            │
   │              │              │ FROM users  │            │
   │              │              │ WHERE id=?  │            │
   │              │              │────────────────────────>│
   │              │              │             │            │
   │              │              │             │  User      │
   │              │              │             │  Exists?   │
   │              │              │             │            │
   │              │              │ ┌───────────────────────┐│
   │              │              │ │ IF User Exists:       ││
   │              │              │ │   UPDATE users        ││
   │              │              │ │   SET name=?,         ││
   │              │              │ │       avatar_url=?,   ││
   │              │              │ │       updated_at=NOW()││
   │              │              │ │   WHERE id=?          ││
   │              │              │ │                       ││
   │              │              │ │ ELSE:                 ││
   │              │              │ │   INSERT INTO users   ││
   │              │              │ │   (id, email, name,   ││
   │              │              │ │    avatar_url,        ││
   │              │              │ │    provider,          ││
   │              │              │ │    provider_id)       ││
   │              │              │ │   VALUES (...)        ││
   │              │              │ └───────────────────────┘│
   │              │              │────────────────────────>│
   │              │              │             │            │
   │              │              │             │  Success   │
   │              │              │<────────────────────────│
   │              │              │             │            │
   │              │  { success:  │             │            │
   │              │    true,     │             │            │
   │              │    user: {   │             │            │
   │              │      id,     │             │            │
   │              │      email,  │             │            │
   │              │      name    │             │            │
   │              │    }         │             │            │
   │              │  }           │             │            │
   │              │<─────────────│             │            │
   │              │              │             │            │
   │  User synced │              │             │            │
   │<─────────────│              │             │            │
   │              │              │             │            │
```

---

## 4. Protected API Request Flow

### Making Authenticated API Requests

```
Frontend      API Client    Auth Middleware   Supabase    Controller   Database
   │              │              │               │            │            │
   │ GET /api/    │              │               │            │            │
   │ assets       │              │               │            │            │
   │─────────────>│              │               │            │            │
   │              │              │               │            │            │
   │              │ Add Auth     │               │            │            │
   │              │ Header:      │               │            │            │
   │              │ Bearer <JWT> │               │            │            │
   │              │              │               │            │            │
   │              │ GET /api/    │               │            │            │
   │              │ assets       │               │            │            │
   │              │─────────────>│               │            │            │
   │              │              │               │            │            │
   │              │              │ Extract JWT   │            │            │
   │              │              │ from Header   │            │            │
   │              │              │               │            │            │
   │              │              │ Verify JWT    │            │            │
   │              │              │──────────────>│            │            │
   │              │              │               │            │            │
   │              │              │ ┌─────────────────────────┐            │
   │              │              │ │ JWT Invalid/Expired?    │            │
   │              │              │ │   → Return 401          │            │
   │              │              │ │                         │            │
   │              │              │ │ JWT Valid?              │            │
   │              │              │ │   → Extract user_id     │            │
   │              │              │ │   → Continue            │            │
   │              │              │ └─────────────────────────┘            │
   │              │              │               │            │            │
   │              │              │ JWT Valid     │            │            │
   │              │              │<──────────────│            │            │
   │              │              │               │            │            │
   │              │              │ req.user = {  │            │            │
   │              │              │   id: user_id │            │            │
   │              │              │ }             │            │            │
   │              │              │               │            │            │
   │              │              │ next()        │            │            │
   │              │              │──────────────────────────>│            │
   │              │              │               │            │            │
   │              │              │               │ SELECT *  │            │
   │              │              │               │ FROM      │            │
   │              │              │               │ assets    │            │
   │              │              │               │ WHERE     │            │
   │              │              │               │ user_id=? │            │
   │              │              │               │───────────────────────>│
   │              │              │               │            │            │
   │              │              │               │            │  Assets    │
   │              │              │               │            │  for User  │
   │              │              │               │<───────────────────────│
   │              │              │               │            │            │
   │              │              │               │ { success: │            │
   │              │              │               │   true,    │            │
   │              │              │               │   data: [] │            │
   │              │              │               │ }          │            │
   │              │<──────────────────────────────────────────│            │
   │              │              │               │            │            │
   │  Assets Data │              │               │            │            │
   │<─────────────│              │               │            │            │
   │              │              │               │            │            │
```


---

## 5. Component Architecture

### Frontend Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── User State
│   ├── Session State
│   └── Auth Methods
│
├── Router
│   ├── Public Routes
│   │   └── LoginPage
│   │       ├── Logo Section
│   │       ├── Auth Instructions
│   │       ├── OAuth Buttons
│   │       │   ├── GoogleButton
│   │       │   └── GitHubButton
│   │       ├── Divider
│   │       ├── Features List
│   │       └── Footer
│   │
│   └── Protected Routes (wrapped with ProtectedRoute)
│       ├── Dashboard
│       │   ├── Hero Section
│       │   ├── Market Benchmarks
│       │   ├── Allocation Section
│       │   └── Stats Grid
│       │
│       ├── AssetTabs
│       │   ├── Fixed Deposits Tab
│       │   ├── Savings Tab
│       │   ├── Equities Tab
│       │   ├── Mutual Funds Tab
│       │   └── Provident Funds Tab
│       │
│       └── Header
│           ├── Logo
│           ├── UserProfile (Dropdown)
│           │   ├── Avatar
│           │   ├── Name
│           │   ├── Email
│           │   └── Logout Button
│           ├── Privacy Toggle
│           └── Theme Toggle
│
└── Global Components
    ├── Toast Notifications
    ├── Error Boundary
    └── Loading Spinner
```

### Component Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      AuthProvider                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  State:                                                 │ │
│  │  - user: User | null                                   │ │
│  │  - session: Session | null                             │ │
│  │  - loading: boolean                                    │ │
│  │                                                         │ │
│  │  Methods:                                              │ │
│  │  - signInWithGoogle()                                  │ │
│  │  - signInWithGithub()                                  │ │
│  │  - signOut()                                           │ │
│  │  - syncUser()                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ useAuth() hook
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Child Components                          │
│                                                              │
│  LoginPage          Dashboard         UserProfile           │
│  - signInWith*()    - user.name       - user.avatar         │
│  - loading          - loading         - user.email          │
│                                       - signOut()            │
│                                                              │
│  ProtectedRoute                                             │
│  - user (check auth)                                        │
│  - loading                                                  │
│  - redirect if !user                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          users                               │
├─────────────────────────────────────────────────────────────┤
│ id                UUID         PRIMARY KEY                   │
│ email             VARCHAR(255) UNIQUE NOT NULL               │
│ name              VARCHAR(255)                               │
│ avatar_url        TEXT                                       │
│ provider          VARCHAR(50)  NOT NULL (google/github)      │
│ provider_id       VARCHAR(255) NOT NULL                      │
│ created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP     │
│ updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP     │
├─────────────────────────────────────────────────────────────┤
│ UNIQUE(provider, provider_id)                               │
│ INDEX idx_users_email (email)                               │
│ INDEX idx_users_provider (provider, provider_id)            │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ 1:N
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                         assets                               │
├─────────────────────────────────────────────────────────────┤
│ id                UUID         PRIMARY KEY                   │
│ user_id           UUID         FOREIGN KEY → users.id        │
│                                ON DELETE CASCADE             │
│ type              VARCHAR(50)  NOT NULL                      │
│ bank_name         VARCHAR(255) NOT NULL                      │
│                                                              │
│ -- Fixed Deposit fields                                     │
│ account_number    VARCHAR(100)                              │
│ principal_amount  DECIMAL(15,2)                             │
│ interest_rate     DECIMAL(5,2)                              │
│ start_date        DATE                                      │
│ maturity_date     DATE                                      │
│                                                              │
│ -- Savings Account fields                                   │
│ current_balance   DECIMAL(15,2)                             │
│                                                              │
│ -- Equity fields                                            │
│ symbol            VARCHAR(20)                               │
│ company_name      VARCHAR(255)                              │
│ exchange          VARCHAR(10)                               │
│ quantity          DECIMAL(15,4)                             │
│ average_price     DECIMAL(15,2)                             │
│ current_price     DECIMAL(15,2)                             │
│                                                              │
│ -- Mutual Fund fields                                       │
│ scheme_code       VARCHAR(20)                               │
│ scheme_name       VARCHAR(255)                              │
│ fund_house        VARCHAR(255)                              │
│ units             DECIMAL(15,4)                             │
│ average_nav       DECIMAL(15,2)                             │
│ current_nav       DECIMAL(15,2)                             │
│                                                              │
│ -- Provident Fund fields                                    │
│ uan               VARCHAR(12)                               │
│ monthly_contribution_employee  DECIMAL(15,2)                │
│ monthly_contribution_employer  DECIMAL(15,2)                │
│ last_updated_date DATE                                      │
│                                                              │
│ created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP     │
│ updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP     │
├─────────────────────────────────────────────────────────────┤
│ INDEX idx_assets_user_id (user_id)                          │
│ INDEX idx_assets_type (type)                                │
│ INDEX idx_assets_user_type (user_id, type)                  │
└─────────────────────────────────────────────────────────────┘
```

### Database Migration Strategy

```
Phase 1: Add Schema (Non-Breaking)
┌─────────────────────────────────────┐
│ Migration 004: Create users table   │
│ - Add users table                   │
│ - Add indexes                       │
│ - Add constraints                   │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│ Migration 005: Add user_id column   │
│ - ALTER TABLE assets                │
│   ADD COLUMN user_id UUID           │
│   REFERENCES users(id)              │
│ - Add index on user_id              │
│ - Column is NULLABLE initially      │
└─────────────────────────────────────┘
              ▼
Phase 2: Data Migration
┌─────────────────────────────────────┐
│ Create default user                 │
│ - INSERT INTO users                 │
│   (id, email, name, provider)       │
│   VALUES (uuid, 'default@local',    │
│           'Default User', 'local')  │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│ Assign existing assets              │
│ - UPDATE assets                     │
│   SET user_id = <default_user_id>   │
│   WHERE user_id IS NULL             │
└─────────────────────────────────────┘
              ▼
Phase 3: Enforce Constraint
┌─────────────────────────────────────┐
│ Migration 006: Make user_id required│
│ - ALTER TABLE assets                │
│   ALTER COLUMN user_id              │
│   SET NOT NULL                      │
└─────────────────────────────────────┘
```

---

## 7. State Management

### Authentication State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Initial State                             │
│  user: null                                                  │
│  session: null                                               │
│  loading: true                                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ App Mount
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Check for Existing Session                      │
│  supabase.auth.getSession()                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
         Session Exists      No Session
                │                   │
                ▼                   ▼
┌───────────────────────┐  ┌──────────────────────┐
│  Authenticated State  │  │  Unauthenticated     │
│  user: User           │  │  user: null          │
│  session: Session     │  │  session: null       │
│  loading: false       │  │  loading: false      │
└───────────────────────┘  └──────────────────────┘
         │                          │
         │                          │
         │                          ▼
         │                 ┌──────────────────────┐
         │                 │  Show Login Page     │
         │                 └──────────────────────┘
         │                          │
         │                          │ User clicks OAuth
         │                          ▼
         │                 ┌──────────────────────┐
         │                 │  OAuth Flow          │
         │                 │  (see diagram 2)     │
         │                 └──────────────────────┘
         │                          │
         │                          │ Success
         │                          ▼
         └─────────────────>┌──────────────────────┐
                            │  Authenticated State │
                            │  Sync user to DB     │
                            │  Redirect to app     │
                            └──────────────────────┘
                                     │
                                     │ User clicks Logout
                                     ▼
                            ┌──────────────────────┐
                            │  signOut()           │
                            │  Clear session       │
                            │  Redirect to login   │
                            └──────────────────────┘
                                     │
                                     ▼
                            ┌──────────────────────┐
                            │  Unauthenticated     │
                            └──────────────────────┘
```

### Session Persistence

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Storage                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  localStorage                                           │ │
│  │  - supabase.auth.token (JWT)                           │ │
│  │  - supabase.auth.token.expires_at                      │ │
│  │  - theme (light/dark)                                  │ │
│  │  - showAmounts (privacy mode)                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ On Page Load
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Client Initialization                  │
│  - Reads token from localStorage                            │
│  - Checks expiration                                        │
│  - Auto-refreshes if needed                                 │
│  - Restores session                                         │
└─────────────────────────────────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
         Token Valid         Token Expired
                │                   │
                ▼                   ▼
┌───────────────────────┐  ┌──────────────────────┐
│  Session Restored     │  │  Attempt Refresh     │
│  User stays logged in │  │  If fails: Logout    │
└───────────────────────┘  └──────────────────────┘
```

---

## 8. Error Handling Flow

### Authentication Error Scenarios

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Scenarios                           │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ OAuth Failed │  │ Token Invalid│  │ Network Error│
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Error Handler                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Log error details                                  │ │
│  │  2. Determine error type                               │ │
│  │  3. Show user-friendly message                         │ │
│  │  4. Provide recovery action                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Show Error   │  │ Clear Session│  │ Retry Button │
│ Message      │  │ Redirect to  │  │ Shown        │
│              │  │ Login        │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Error Message Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Code → User Message                 │
├─────────────────────────────────────────────────────────────┤
│ OAuth Cancelled                                             │
│ → "Sign in was cancelled. Please try again."               │
├─────────────────────────────────────────────────────────────┤
│ OAuth Failed                                                │
│ → "Authentication failed. Please try again."               │
├─────────────────────────────────────────────────────────────┤
│ Network Error                                               │
│ → "Unable to connect. Check your internet connection."     │
├─────────────────────────────────────────────────────────────┤
│ Token Expired                                               │
│ → "Your session has expired. Please sign in again."        │
├─────────────────────────────────────────────────────────────┤
│ Invalid Token                                               │
│ → "Authentication error. Please sign in again."            │
├─────────────────────────────────────────────────────────────┤
│ User Sync Failed                                            │
│ → "Account setup incomplete. Please try again."            │
├─────────────────────────────────────────────────────────────┤
│ Database Error                                              │
│ → "Service temporarily unavailable. Please try again."     │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 1: Transport                        │
│  - HTTPS only                                               │
│  - TLS 1.3                                                  │
│  - Secure headers (HSTS, CSP)                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 2: Authentication                   │
│  - OAuth 2.0 with PKCE                                      │
│  - JWT tokens (signed by Supabase)                          │
│  - Token expiration (7 days)                                │
│  - Auto token refresh                                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 3: Authorization                    │
│  - JWT verification on every request                        │
│  - User ID extraction from token                            │
│  - Row-level security (user_id filter)                      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 4: Data Access                      │
│  - Parameterized queries (SQL injection prevention)         │
│  - Foreign key constraints                                  │
│  - CASCADE delete (data cleanup)                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 5: Application                      │
│  - Input validation                                         │
│  - XSS prevention (React escaping)                          │
│  - CSRF protection                                          │
│  - Rate limiting (future)                                   │
└─────────────────────────────────────────────────────────────┘
```

### JWT Token Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    JWT Token                                 │
├─────────────────────────────────────────────────────────────┤
│  Header:                                                    │
│  {                                                          │
│    "alg": "HS256",                                          │
│    "typ": "JWT"                                             │
│  }                                                          │
├─────────────────────────────────────────────────────────────┤
│  Payload:                                                   │
│  {                                                          │
│    "sub": "user-uuid",           // User ID                │
│    "email": "user@example.com",  // User email             │
│    "aud": "authenticated",       // Audience               │
│    "role": "authenticated",      // Role                   │
│    "iat": 1234567890,            // Issued at              │
│    "exp": 1234567890,            // Expires at             │
│    "app_metadata": {             // Custom metadata        │
│      "provider": "google"                                   │
│    }                                                        │
│  }                                                          │
├─────────────────────────────────────────────────────────────┤
│  Signature:                                                 │
│  HMACSHA256(                                                │
│    base64UrlEncode(header) + "." +                          │
│    base64UrlEncode(payload),                                │
│    secret                                                   │
│  )                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                         CDN (Vercel/Netlify)                 │
│  - Static assets (HTML, CSS, JS)                           │
│  - Global edge network                                      │
│  - HTTPS/TLS termination                                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                      │
│  - Served from CDN                                          │
│  - Client-side routing                                      │
│  - Supabase client                                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Auth Service)                   │
│  - OAuth provider integration                               │
│  - JWT token management                                     │
│  - User authentication                                      │
│  - Hosted service (managed)                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                     │
│  - Hosted on Vercel/Railway/Render                          │
│  - Serverless or container                                  │
│  - Environment variables                                    │
│  - CORS configured                                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (Neon PostgreSQL)                │
│  - Managed PostgreSQL                                       │
│  - Connection pooling                                       │
│  - Automatic backups                                        │
│  - Free tier (hobby project)                                │
└─────────────────────────────────────────────────────────────┘
```

### Environment Variables

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (.env)                           │
├─────────────────────────────────────────────────────────────┤
│ VITE_SUPABASE_URL=https://xxx.supabase.co                  │
│ VITE_SUPABASE_ANON_KEY=eyJhbGc...                          │
│ VITE_API_URL=https://api.yourapp.com                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Backend (.env)                            │
├─────────────────────────────────────────────────────────────┤
│ SUPABASE_URL=https://xxx.supabase.co                       │
│ SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...                       │
│ SUPABASE_JWT_SECRET=your-jwt-secret                        │
│ DATABASE_URL=postgresql://user:pass@host:5432/db           │
│ NODE_ENV=production                                         │
│ PORT=3000                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

This document provides comprehensive design diagrams for the authentication system including:

1. **System Architecture** - High-level overview of all components
2. **OAuth Flow** - Detailed sequence diagram for Google/GitHub login
3. **User Sync** - How Supabase users are synced to local database
4. **API Requests** - Protected endpoint authentication flow
5. **Component Architecture** - Frontend component hierarchy and data flow
6. **Database Schema** - ERD and migration strategy
7. **State Management** - Authentication state lifecycle
8. **Error Handling** - Error scenarios and recovery flows
9. **Security** - Multi-layer security architecture
10. **Deployment** - Production environment setup

These diagrams serve as the technical blueprint for implementing the authentication feature as specified in the requirements and design documents.
