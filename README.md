# Koutuhal Pathways - AI-Powered Career Acceleration Platform

> **Full-stack production-ready application** with React, FastAPI, Supabase PostgreSQL, Redis, and AI capabilities.

## 🚨 FIRST-TIME SETUP (Required - 2 minutes)

**If you're seeing "Server Error (500)" when trying to sign up:**

→ **Read `IMPORTANT_SETUP_REQUIRED.md` first!** ←

You need to configure your Supabase database password in `backend/.env`. This is a one-time setup that takes 2 minutes.

---

## 🎯 What This Application Does

**Koutuhal Pathways** is a complete career platform featuring:

- 🎓 **AI-Powered Resume Analysis** - Intelligent resume scoring and recommendations
- 💼 **Smart Job Matching** - AI-driven candidate-to-role matching
- 📚 **Premium Course Catalog** - Educational content with enrollment and payments
- 👥 **Mentorship Platform** - 1-on-1 sessions with industry experts
- 📝 **Resume Builder & Scanner** - ATS-optimized resume creation
- 📊 **Application Dashboard** - Track job applications and rankings
- 🔐 **Secure Authentication** - JWT + Google OAuth
- 💳 **Payment Integration** - Razorpay for course purchases
- 🎯 **Admin Panel** - User management and analytics

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- OR: Node.js 18+, Python 3.11+, and PostgreSQL
- **Supabase Account** (free tier works)

### Option 1: Docker (Recommended)

```bash
# 1. Configure database password (see IMPORTANT_SETUP_REQUIRED.md)
#    Edit backend/.env and add your Supabase password

# 2. Start everything
docker-compose up --build

# 3. Access the application
open http://localhost:3000
```

### Option 2: Manual Setup

```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# 2. Start Backend
cd backend
pip install -r requirements.txt
# Configure backend/.env with Supabase credentials
uvicorn app.main:app --reload

# 3. Start Worker (in another terminal)
cd backend
python -m app.worker

# 4. Start Frontend (in another terminal)
npm install
npm run dev
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[IMPORTANT_SETUP_REQUIRED.md](./IMPORTANT_SETUP_REQUIRED.md)** | 🚨 **START HERE** - Fix "Server Error (500)" |
| **[QUICK_START.md](./QUICK_START.md)** | 5-minute setup guide |
| **[SETUP.md](./SETUP.md)** | Complete setup & deployment guide |
| **[CHANGES.md](./CHANGES.md)** | Detailed changelog and technical docs |
| **[GET_SUPABASE_PASSWORD.md](./GET_SUPABASE_PASSWORD.md)** | How to get your database password |

---

## 🗄️ Database Setup (REQUIRED)

### All tables are already created in Supabase!

The database schema has been applied with **11 tables**:

✅ users, resumes, jobs, applications, courses, orders, user_entitlements, uploaded_files, ai_jobs, mentor_sessions, audit_logs

**You just need to:**
1. Add your Supabase password to `backend/.env`
2. Restart the backend
3. Done!

See `IMPORTANT_SETUP_REQUIRED.md` for step-by-step instructions.

---

## 🌐 Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🧪 Test Database Connection

```bash
cd backend
python test_db_connection.py
```

Expected output:
```
✅ Database connection test: PASSED
✅ Found 11 tables
```

---

## 📦 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui
- React Query (TanStack)
- React Router
- Framer Motion (animations)

### Backend
- FastAPI (Python)
- SQLAlchemy (async ORM)
- Pydantic (validation)
- JWT Authentication
- Redis (job queue)
- OpenAI GPT-4 (AI features)

### Database & Infrastructure
- **Supabase PostgreSQL** (production database)
- Redis (background jobs)
- Docker & Docker Compose
- Nginx (production)

### Integrations
- Google OAuth 2.0
- Razorpay (payments)
- OpenAI API (AI analysis)

---

## 🎨 Features

### For Students
- Create and scan resumes
- Get AI-powered job matches
- Apply to jobs with intelligent ranking
- Enroll in AI/Tech courses
- Book mentorship sessions
- Track application status

### For Mentors
- Manage mentorship requests
- Schedule 1-on-1 sessions
- Track session history

### For Admins
- User management
- Course creation
- Analytics dashboard
- Export data (CSV)
- Monitor applications and payments

---

## 🔐 Authentication

- **Email/Password:** JWT-based authentication
- **Google OAuth:** One-click social login
- **Role-Based Access:** Student, Mentor, Admin, Organisation, Super Admin
- **Onboarding Flow:** First-time user setup

---

## 💰 Payments

- **Razorpay Integration** (test mode for development)
- **Course Purchases** with secure payment verification
- **Order Management** and history
- **Entitlement System** for course access

---

## 🤖 AI Features

- **Resume Analysis:** Detailed feedback and scoring
- **Job Matching:** ML-powered candidate-job matching
- **Application Scoring:** Rank applicants by fit
- **Background Processing:** Async AI job queue

Requires OpenAI API key (optional, can be added later).

---

## 📖 API Documentation

Visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google` - Google OAuth
- `GET /api/v1/jobs/` - List jobs
- `POST /api/v1/jobs/{id}/apply` - Apply to job
- `GET /api/v1/payments/courses` - List courses
- `POST /api/v1/payments/create-order` - Create payment
- `GET /api/v1/admin/analytics/stats` - Admin analytics

---

## 🧰 Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn app.main:app --reload --port 8000

# Run tests
pytest

# Check database connection
python test_db_connection.py
```

### Frontend Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

### Database Migrations

```bash
cd backend

# Create new migration
alembic revision -m "description"

# Run migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f api
docker-compose logs -f worker

# Restart specific service
docker-compose restart api
```

---

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL`

### Backend (Cloud Run/Railway/Render)

1. Build Docker image
2. Deploy with environment variables from `backend/.env.example`
3. Use Supabase pooler connection for better performance
4. Deploy worker as separate service

See `SETUP.md` for detailed deployment instructions.

---

## 🔧 Configuration

### Backend Environment Variables

All configured in `backend/.env`:

- **Database:** Supabase PostgreSQL connection
- **Security:** JWT secret key
- **OAuth:** Google Client ID
- **Payments:** Razorpay keys
- **AI:** OpenAI API key
- **Queue:** Redis URL

### Frontend Environment Variables

All configured in `.env`:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_API_URL` - Backend API URL

---

## ⚠️ Troubleshooting

### "Server Error (500)" on signup/login

**Solution:** Configure your Supabase password in `backend/.env`

See `IMPORTANT_SETUP_REQUIRED.md` for step-by-step fix.

### "Connection refused" errors

1. Check Supabase credentials in `backend/.env`
2. Verify IP allowed in Supabase Dashboard
3. Test connection: `python backend/test_db_connection.py`

### Redis connection errors

```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Verify it's running
redis-cli ping
# Should return: PONG
```

### Frontend won't start

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start

```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
python test_db_connection.py
```

---

## 📝 License

This project is proprietary software.

---

## 🤝 Support

- **Documentation:** Check all `.md` files in the project root
- **API Docs:** http://localhost:8000/docs
- **Database Schema:** See `supabase_schema.sql`

---

## ✨ Key Features

- ✅ **No Mock Data** - All data is real and persisted
- ✅ **Production Ready** - Fully functional with real integrations
- ✅ **Secure** - JWT auth, RBAC, proper password hashing
- ✅ **Scalable** - Async processing, connection pooling
- ✅ **Well Documented** - Comprehensive guides and API docs
- ✅ **Docker Ready** - One-command deployment
- ✅ **Modern Stack** - Latest versions of all technologies

---

**🚀 Ready to start? Read `IMPORTANT_SETUP_REQUIRED.md` first!**
