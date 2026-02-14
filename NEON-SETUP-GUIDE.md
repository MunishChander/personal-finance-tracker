# Neon Database Setup Guide

## Complete Step-by-Step Guide to Set Up Neon PostgreSQL

---

## Step 1: Create Neon Account (2 minutes)

### 1.1 Go to Neon Website
```
🌐 Open: https://neon.tech
```

### 1.2 Sign Up
Click **"Sign Up"** button and choose one of:
- **GitHub** (Recommended - fastest)
- **Google**
- **Email**

### 1.3 Verify Email (if using email signup)
- Check your email inbox
- Click verification link
- Return to Neon dashboard

✅ **You're now logged into Neon!**

---

## Step 2: Create Your Database Project (3 minutes)

### 2.1 Create New Project
Once logged in, you'll see the dashboard. Click **"Create a project"** or **"New Project"**

### 2.2 Configure Project Settings

Fill in the form:

```yaml
Project Name: personal-finance-tracker
  (or any name you prefer)

Region: Choose closest to you
  - US East (Ohio) - for USA East Coast
  - US West (Oregon) - for USA West Coast
  - Europe (Frankfurt) - for Europe
  - Asia Pacific (Singapore) - for Asia
  
PostgreSQL Version: 16 (latest)
  (Keep default - latest version)

Compute Size: 
  - Keep default (0.25 vCPU, 1 GB RAM)
  - This is FREE tier
```

### 2.3 Click "Create Project"

Neon will create your database in ~10 seconds.

✅ **Your PostgreSQL database is now live!**

---

## Step 3: Get Your Connection String (1 minute)

After project creation, you'll see the **Connection Details** page.

### 3.1 Find Connection String

You'll see something like this:

```
Connection String:
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3.2 Copy the Connection String

Click the **"Copy"** button next to the connection string.

**Important:** This string contains:
- Username
- Password
- Host
- Database name
- SSL mode

### 3.3 Save It Somewhere Safe

Paste it in a temporary note (you'll use it in the next step).

**Example connection string:**
```
postgresql://alex:AbC123XyZ@ep-cool-breeze-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## Step 4: Add Connection String to Your Project (2 minutes)

Now let's add this to your project's environment variables.

### 4.1 Create Backend .env File

In your project, create a file at `backend/.env`:

```bash
# Navigate to backend folder
cd personal-finance-tracker/backend

# Create .env file (if it doesn't exist)
touch .env
```

### 4.2 Add Database URL

Open `backend/.env` and add:

```env
# Database Configuration
DATABASE_URL=postgresql://your-username:your-password@your-host.neon.tech/neondb?sslmode=require

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

**Replace the DATABASE_URL with your actual connection string from Step 3.2**

### 4.3 Create Database .env File

Create `database/.env`:

```bash
cd ../database
touch .env
```

Add the same connection string:

```env
DATABASE_URL=postgresql://your-username:your-password@your-host.neon.tech/neondb?sslmode=require
```

### 4.4 Create Frontend .env File

Create `frontend/.env`:

```bash
cd ../frontend
touch .env
```

Add:

```env
VITE_API_URL=http://localhost:3000/api
VITE_ENV=development
```

---

## Step 5: Test Database Connection (2 minutes)

Let's verify the connection works!

### 5.1 Install PostgreSQL Client (if not already installed)

```bash
npm install pg
```

### 5.2 Create Test Script

Create a file `test-db-connection.js` in your project root:

```javascript
// test-db-connection.js
const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Neon database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', result.rows[0].version);
    
    await client.end();
    console.log('👋 Connection closed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

### 5.3 Run Test

```bash
node test-db-connection.js
```

**Expected output:**
```
🔌 Connecting to Neon database...
✅ Connected successfully!
📊 PostgreSQL version: PostgreSQL 16.x on x86_64-pc-linux-gnu...
👋 Connection closed
```

✅ **If you see this, your database is connected!**

---

## Step 6: Understanding Your Neon Dashboard (Optional)

### 6.1 Access Dashboard

Go back to https://console.neon.tech

### 6.2 Key Features

**Tables Tab:**
- View all your database tables
- Browse data
- Run SQL queries

**Branches Tab:**
- Create database branches (like Git branches)
- Test changes without affecting production

**Operations Tab:**
- View database activity
- Monitor queries
- Check performance

**Settings Tab:**
- View connection details
- Manage compute settings
- Configure auto-suspend

---

## Step 7: Neon-Specific Configuration (Optional but Recommended)

### 7.1 Connection Pooling

For better performance, use Neon's connection pooling:

In Neon dashboard, you'll see two connection strings:

1. **Direct connection** (for migrations):
   ```
   postgresql://user:pass@host.neon.tech/neondb
   ```

2. **Pooled connection** (for app):
   ```
   postgresql://user:pass@host-pooler.neon.tech/neondb
   ```

**Recommendation:**
- Use **pooled connection** for your backend API
- Use **direct connection** for database migrations

Update your `.env`:

```env
# For backend API (pooled)
DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/neondb?sslmode=require

# For migrations (direct)
DATABASE_MIGRATION_URL=postgresql://user:pass@host.neon.tech/neondb?sslmode=require
```

### 7.2 Auto-Suspend Settings

Neon automatically pauses your database after inactivity to save resources.

**Default:** Suspends after 5 minutes of inactivity (FREE tier)

To check/modify:
1. Go to Neon Dashboard
2. Click your project
3. Go to **Settings** > **Compute**
4. See "Auto-suspend delay"

**For development:** Keep default (5 minutes)
**For production:** Upgrade to Pro ($19/month) for "always on"

---

## Common Issues & Solutions

### Issue 1: "Connection refused"

**Solution:**
- Check your connection string is correct
- Ensure you copied the entire string including `?sslmode=require`
- Verify your internet connection

### Issue 2: "SSL connection required"

**Solution:**
Add `?sslmode=require` to the end of your connection string:
```
postgresql://user:pass@host.neon.tech/neondb?sslmode=require
```

### Issue 3: "Database does not exist"

**Solution:**
- The default database is called `neondb`
- Check your connection string has the correct database name
- You can create additional databases in Neon dashboard

### Issue 4: "Password authentication failed"

**Solution:**
- Go to Neon dashboard
- Click **Settings** > **Reset password**
- Get new connection string
- Update your `.env` file

### Issue 5: "Cold start delay"

**Explanation:**
- Neon auto-suspends after inactivity (FREE tier)
- First query after suspension takes 1-2 seconds
- Subsequent queries are instant

**Solution:**
- This is normal for FREE tier
- Upgrade to Pro for "always on" if needed

---

## Security Best Practices

### ✅ DO:
- Keep `.env` files in `.gitignore`
- Never commit connection strings to Git
- Use environment variables for all secrets
- Rotate passwords periodically

### ❌ DON'T:
- Share connection strings publicly
- Commit `.env` files to GitHub
- Use same password for multiple services
- Hardcode connection strings in code

---

## Neon Free Tier Limits

Your FREE tier includes:

```yaml
Storage: 0.5 GB
  - Enough for ~50,000 records
  - Perfect for hobby projects

Compute: 0.25 vCPU, 1 GB RAM
  - Handles ~100 concurrent users
  - Auto-scales to zero when idle

Data Transfer: 3 GB/month
  - Plenty for development
  - ~300,000 API requests

Branches: Unlimited
  - Create test environments
  - No additional cost

Projects: Unlimited
  - Multiple apps on FREE tier
```

**When to upgrade:**
- Storage > 0.5 GB: Upgrade to Launch ($19/month, 3 GB)
- Need "always on": Upgrade to Launch ($19/month)
- More compute power: Upgrade to Scale ($69/month)

---

## Next Steps

Now that Neon is set up:

1. ✅ **Database is ready** - Neon PostgreSQL is live
2. ✅ **Connection string saved** - In `.env` files
3. ✅ **Connection tested** - Verified it works

**You're ready to:**
- Create database tables (migrations)
- Connect your backend API
- Start building your app!

---

## Quick Reference

### Connection String Format
```
postgresql://[username]:[password]@[host]/[database]?sslmode=require
```

### Environment Variables
```env
# Backend & Database
DATABASE_URL=postgresql://user:pass@host.neon.tech/neondb?sslmode=require

# Backend Only
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Frontend Only
VITE_API_URL=http://localhost:3000/api
```

### Useful Links
- Dashboard: https://console.neon.tech
- Documentation: https://neon.tech/docs
- Status Page: https://neonstatus.com
- Community: https://discord.gg/neon

---

## Summary Checklist

- [ ] Created Neon account
- [ ] Created project "personal-finance-tracker"
- [ ] Copied connection string
- [ ] Created `backend/.env` with DATABASE_URL
- [ ] Created `database/.env` with DATABASE_URL
- [ ] Created `frontend/.env` with VITE_API_URL
- [ ] Tested connection with test script
- [ ] Added `.env` to `.gitignore`

**All done? You're ready to start Phase 1! 🚀**

---

## Need Help?

If you encounter any issues:

1. **Check Neon Status:** https://neonstatus.com
2. **Read Docs:** https://neon.tech/docs
3. **Join Discord:** https://discord.gg/neon
4. **Contact Support:** support@neon.tech

Your database is now ready for development! 🎉
