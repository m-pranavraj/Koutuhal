# Koutuhal Pathways - Setup Guide

Complete guide to set up and run the Koutuhal Pathways application locally and in production.

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose
- Supabase account
- Google OAuth credentials (optional, for Google login)
- Razorpay account (optional, for payments)
- OpenAI API key (optional, for AI features)

## Quick Start (Development)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd koutuhal-pathways
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Project Settings > Database**
3. Note down your connection details:
   - Project Ref (format: `abc123def456`)
   - Database Password
   - Pooler connection string

4. Navigate to **Project Settings > API** and copy:
   - Project URL
   - anon/public key

5. Run the database schema:
   - Go to **SQL Editor** in Supabase Dashboard
   - Copy the contents of `supabase_schema.sql`
   - Execute the SQL to create all tables

### 3. Configure Environment Variables

#### Backend Configuration

Create `/backend/.env`:

```bash
# Copy from example
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your actual values:

```env
# Supabase PostgreSQL Connection
POSTGRES_USER=postgres.[your-project-ref]
POSTGRES_PASSWORD=your-supabase-db-password
POSTGRES_SERVER=aws-0-us-west-1.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_DB=postgres

# Generate a secure secret key (use: openssl rand -hex 32)
SECRET_KEY=your-secure-secret-key-here

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Razorpay (Get from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Redis (local for development)
REDIS_URL=redis://redis:6379/0

# OpenAI API (for AI features)
LLM_API_KEY=sk-your-openai-api-key
LLM_MODEL=gpt-4-turbo-preview
```

#### Frontend Configuration

Edit `/.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:8000
```

### 4. Install Dependencies

#### Frontend

```bash
npm install
```

#### Backend

```bash
cd backend
pip install -r requirements.txt
```

### 5. Run with Docker Compose

The easiest way to run everything:

```bash
docker-compose up --build
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:8000
- Redis on localhost:6379
- Background worker for AI jobs

**Note:** The local PostgreSQL database is removed - you're now using Supabase!

### 6. Run Locally (Without Docker)

#### Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install Redis locally
# macOS: brew install redis && redis-server
# Ubuntu: sudo apt install redis-server && redis-server
```

#### Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

#### Start Worker (in another terminal)

```bash
cd backend
python -m app.worker
```

#### Start Frontend (in another terminal)

```bash
npm run dev
```

Visit http://localhost:5173 (Vite dev server)

## Database Setup

### Apply Schema to Supabase

1. Open Supabase Dashboard > SQL Editor
2. Copy contents of `supabase_schema.sql`
3. Run the SQL

This creates:
- All tables (users, resumes, jobs, applications, courses, etc.)
- Enums (userrole, jobstatus)
- Indexes for performance
- Foreign key constraints

### Seed Initial Data (Optional)

You can seed sample courses and jobs via the admin endpoints:

```bash
# Login as admin first, then:
curl -X POST http://localhost:8000/api/v1/payments/seed-courses \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST http://localhost:8000/api/v1/jobs/seed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Configure:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000`
6. Copy the Client ID to your backend `.env` file

## Razorpay Setup

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Create account and verify
3. Navigate to **Settings > API Keys**
4. Generate Test Keys (for development)
5. Copy Key ID and Secret to backend `.env` file

**Note:** For production, use Live Keys

## Production Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to Vercel/Netlify

3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your backend URL)

### Backend (Cloud Run/Railway/Render)

1. Build Docker image:
   ```bash
   cd backend
   docker build -t koutuhal-api .
   ```

2. Deploy to Cloud Run/Railway/Render

3. Set all environment variables from `.env.example`

4. Ensure Supabase connection uses direct connection for migrations:
   - `POSTGRES_SERVER=db.your-project-ref.supabase.co`
   - `POSTGRES_PORT=5432`

5. Use pooler connection for runtime:
   - `POSTGRES_SERVER=aws-0-us-west-1.pooler.supabase.com`
   - `POSTGRES_PORT=6543`

### Redis (Production)

Use a managed Redis service:
- [Upstash](https://upstash.com) - Serverless Redis
- [Redis Cloud](https://redis.com/cloud/)
- AWS ElastiCache

Update `REDIS_URL` in backend .env

### Worker Deployment

Deploy the worker as a separate service:

```bash
docker build -t koutuhal-worker -f backend/Dockerfile backend/
# Run with command: python -m app.worker
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Troubleshooting

### Database Connection Issues

1. Verify Supabase credentials in `.env`
2. Check if your IP is allowed (Supabase > Settings > Database > Connection Pooling)
3. For migrations, use direct connection (port 5432)
4. For runtime, use pooler connection (port 6543)

### Redis Connection Issues

1. Ensure Redis is running: `docker ps` or `redis-cli ping`
2. Check `REDIS_URL` in backend `.env`
3. For production, use managed Redis service

### Worker Not Processing Jobs

1. Check worker logs: `docker logs koutuhal-worker`
2. Verify Redis connection
3. Ensure `LLM_API_KEY` is set if using AI features
4. Check AI job status via API: `/api/v1/ai/jobs/{job_id}`

### OAuth Issues

1. Verify `GOOGLE_CLIENT_ID` matches Google Console
2. Check authorized origins/redirect URIs
3. Ensure frontend is using correct client ID

### Build Errors

Frontend:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

Backend:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## Development Notes

### Mock Data

All mock data has been removed. The application now:
- Uses real Supabase PostgreSQL for all data
- Razorpay integration (real or dev mode based on keys)
- Real AI processing via OpenAI API (requires API key)

### Seed Endpoints

For development, you can use seed endpoints:
- `POST /api/v1/payments/seed-courses` - Creates 9 sample courses
- `POST /api/v1/jobs/seed` - Creates 3 sample jobs

These require admin authentication.

### Creating Admin User

1. Register normally via `/api/v1/auth/register`
2. Manually update role in Supabase:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL (Supabase)
- **Database:** Supabase PostgreSQL
- **Queue:** Redis
- **AI:** OpenAI GPT-4
- **Payments:** Razorpay
- **Auth:** JWT + Google OAuth2

## Support

For issues or questions, refer to:
- API Documentation: http://localhost:8000/docs
- Supabase Documentation: https://supabase.com/docs
- FastAPI Documentation: https://fastapi.tiangolo.com
