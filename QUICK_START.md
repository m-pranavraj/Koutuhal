# Quick Start Guide

Get Koutuhal Pathways running in 5 minutes.

## Prerequisites

- Supabase account (free tier works)
- Node.js 18+ and npm
- Docker (optional but recommended)

## 1. Set Up Supabase (2 minutes)

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in dashboard
3. Copy and run `supabase_schema.sql` from this repository
4. Go to **Project Settings > Database** and note:
   - Project Ref (e.g., `abc123def456`)
   - Database Password
5. Go to **Project Settings > API** and copy:
   - Project URL
   - Anon Key

## 2. Configure Environment (1 minute)

### Backend (.env)

Create `/backend/.env`:

```env
# Replace with your Supabase values
POSTGRES_USER=postgres.abc123def456
POSTGRES_PASSWORD=your-supabase-password
POSTGRES_SERVER=aws-0-us-west-1.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_DB=postgres

# Generate with: openssl rand -hex 32
SECRET_KEY=generate-a-random-secret-key

# Optional (use placeholders for now)
GOOGLE_CLIENT_ID=placeholder
RAZORPAY_KEY_ID=placeholder
RAZORPAY_KEY_SECRET=placeholder
LLM_API_KEY=placeholder
REDIS_URL=redis://redis:6379/0
```

### Frontend (.env)

Update `/.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

## 3. Run with Docker (2 minutes)

```bash
docker-compose up --build
```

That's it! Visit:
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs
- **Backend:** http://localhost:8000

## 4. Create Your First User

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create an account
4. Done!

## Make Yourself Admin (Optional)

Run in Supabase SQL Editor:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';
```

## Seed Sample Data (Optional)

```bash
# Login to get your token, then:
curl -X POST http://localhost:8000/api/v1/payments/seed-courses \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST http://localhost:8000/api/v1/jobs/seed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues

### "Connection Refused" to Database
- Check Supabase credentials in `backend/.env`
- Verify your IP is allowed in Supabase settings
- Use pooler port 6543, not direct port 5432

### Redis Connection Error
- Ensure Docker is running
- Check if redis container is up: `docker ps`

### Build Errors
```bash
# Frontend
rm -rf node_modules && npm install

# Backend
cd backend && pip install -r requirements.txt
```

## What's Next?

- **Full Setup Guide:** See `SETUP.md` for production deployment
- **All Changes:** See `CHANGES.md` for complete change log
- **API Docs:** Visit http://localhost:8000/docs
- **Optional Features:**
  - Add Google OAuth credentials for social login
  - Add Razorpay keys for real payments
  - Add OpenAI API key for AI features

## Architecture

```
┌─────────────┐
│   Frontend  │ (React/Vite)
│ Port 3000   │
└──────┬──────┘
       │
┌──────▼──────┐     ┌─────────────┐
│   Backend   │────▶│  Supabase   │
│   FastAPI   │     │  PostgreSQL │
│  Port 8000  │     └─────────────┘
└──────┬──────┘
       │
┌──────▼──────┐     ┌─────────────┐
│   Worker    │────▶│    Redis    │
│  AI Jobs    │     │  Port 6379  │
└─────────────┘     └─────────────┘
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** FastAPI, SQLAlchemy, Pydantic
- **Database:** Supabase PostgreSQL
- **Queue:** Redis
- **AI:** OpenAI GPT-4 (optional)
- **Auth:** JWT + Google OAuth
- **Payments:** Razorpay (optional)

## Support

Questions? Check:
1. `SETUP.md` - Complete setup instructions
2. `CHANGES.md` - What was changed and why
3. http://localhost:8000/docs - API documentation
