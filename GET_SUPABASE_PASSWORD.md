# How to Get Your Supabase Database Password

## Quick Guide

Your Supabase database password is needed in `backend/.env` for the backend to connect to your database.

### Step 1: Go to Supabase Dashboard

Visit [https://supabase.com/dashboard](https://supabase.com/dashboard) and login

### Step 2: Select Your Project

Click on your project: **0ec90b57d6e95fcbda19832f**

### Step 3: Navigate to Database Settings

1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **Database**

### Step 4: Find Your Password

You'll see a section called **Connection String**. Your password is shown there.

**IMPORTANT:** If you don't remember your password, you can reset it:

1. In the Database settings page
2. Scroll to **Database Password**
3. Click **Reset Database Password**
4. Copy the new password immediately (you won't see it again!)

### Step 5: Update backend/.env

Edit `/backend/.env` and update this line:

```env
POSTGRES_PASSWORD=your-actual-password-here
```

Replace `your-actual-password-here` with the password you copied.

## Full Connection Details

Your complete connection details are:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<YOUR_PASSWORD>
POSTGRES_SERVER=db.0ec90b57d6e95fcbda19832f.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
```

## Alternative: Using Connection Pooler (Recommended for Production)

For better performance in production:

```env
POSTGRES_SERVER=aws-0-us-west-1.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_USER=postgres.0ec90b57d6e95fcbda19832f
```

Note: The pooler requires the full username format: `postgres.[project-ref]`

## Verify Connection

After updating `.env`, test the connection:

```bash
cd backend
python test_db_connection.py
```

You should see:
```
✅ Database connection test: PASSED
```

## Troubleshooting

### "Connection refused" or "Timeout"

1. **Check if your IP is allowed:**
   - Go to Supabase Dashboard > Settings > Database
   - Scroll to **Connection Pooling**
   - Add your IP address or enable "Allow all IPs" for development

2. **Verify the password:**
   - Make sure there are no extra spaces
   - Try resetting the password

3. **Use direct connection instead of pooler:**
   - Set `POSTGRES_SERVER=db.0ec90b57d6e95fcbda19832f.supabase.co`
   - Set `POSTGRES_PORT=5432`
   - Set `POSTGRES_USER=postgres`

### Still having issues?

Run the diagnostic:

```bash
cd backend
python -c "from app.core.config import settings; print(f'Connecting to: {settings.SQLALCHEMY_DATABASE_URI}')"
```

This will show you the exact connection string being used (password will be visible, so don't share the output publicly!).

## Security Note

**Never commit your database password to version control!**

The `.env` file is already in `.gitignore`, but always double-check before committing.
