# 🚀 Start Your Application - One Command

## Run This Single Command:

```bash
./setup_and_run.sh
```

That's it! The script will:
1. ✅ Check your configuration
2. ✅ Ask for your Supabase password (one time only)
3. ✅ Configure everything automatically
4. ✅ Start all services
5. ✅ Open your application

---

## What You Need

**Your Supabase database password** (get it once):

1. Go to: https://supabase.com/dashboard/project/nudmtgbbqkjgwqwztveo
2. Click: **Settings** → **Database**
3. Click: **Reset Database Password**
4. Copy the password that appears

---

## After Running the Script

Your application will be live at:
- **http://localhost:3000** - Your app!
- **http://localhost:8000/docs** - API documentation

**Just create your account and start using it!**

---

## Alternative: Manual Setup (if script doesn't work)

If you prefer to do it manually:

### Step 1: Add Password to Config
Edit `backend/.env` line 2:
```env
POSTGRES_PASSWORD=your-database-password-here
```

### Step 2: Start Services
```bash
docker-compose up --build
```

### Step 3: Access Application
Visit http://localhost:3000

---

## Troubleshooting

### Script says "Docker is not running"
→ Start Docker Desktop first

### Still getting "Server Error (500)"
→ Check the password in `backend/.env` is correct

### Want to see what's happening?
```bash
docker-compose logs -f api
```

---

## That's Really It!

Your application is **100% configured**. You just need to provide your Supabase password once, and everything else is automatic.

**One command. One password. Done.** 🎉
