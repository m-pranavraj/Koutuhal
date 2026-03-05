# Local Testing Guide

## ✅ Running Status

- **Backend**: http://localhost:8000 (FastAPI Server)
  - OpenAPI Docs: http://localhost:8000/docs
  - GROQ API: ✅ Configured
  - Database: ✅ Supabase PostgreSQL

- **Frontend**: http://localhost:8080 (Vite Dev Server)
  - Supabase Auth: ✅ Fixed (.env updated)

---

## 🧪 Test Cases

### 1. **Google Sign-In** ✅ SHOULD NOW WORK
Navigate to: http://localhost:8080
1. Click **"Sign Up with Google"** button
2. You should be redirected to Google login
3. After login, you should return to the app with user profile loaded
4. Check: Browser localStorage should have `koutuhal_token` & `user` data

**Expected Result**: Login works, redirected to dashboard

---

### 2. **Manual Email Sign-Up** ✅ SHOULD NOW WORK
1. Click **"Sign Up"** at http://localhost:8080
2. Fill in: Email, Password, Name, Role
3. Click **"Sign Up"**

**Expected Result**: New user created in Supabase, redirected to dashboard

---

### 3. **Manual Email Sign-In** ✅ SHOULD NOW WORK
1. Click **"Sign In"** at http://localhost:8080
2. Enter your email & password (from sign-up)
3. Click **"Sign In"**

**Expected Result**: Logged in, JWT token stored in localStorage

---

### 4. **Tailor Resume Feature** ✅ SHOULD NOW WORK
1. Go to: http://localhost:8080/dashboard → **Resume Tailor**
2. **Paste this sample resume**:
```
John Smith
john@email.com | 123-456-7890

PROFESSIONAL SUMMARY
5+ years full-stack developer with React, Node.js, and AWS experience.

TECHNICAL SKILLS
Languages: JavaScript, Python, SQL, TypeScript
Frameworks: React, Node.js, Express.js
Cloud: AWS, Docker, Kubernetes

EXPERIENCE
Software Developer | Tech Company
August 2021 – Present
- Led development of microservices serving 100K+ daily users
- Reduced API latency by 40% through caching
- Managed team of 3 developers

EDUCATION
Bachelor of Computer Science
University of Tech | 2020
GPA: 3.8
```

3. **Paste this sample job description**:
```
Senior Full-Stack Developer

Requirements:
- 5+ years in full-stack development
- Strong JavaScript and Python skills
- Experience with microservices architecture
- AWS cloud deployment
- Docker and Kubernetes proficiency
- Team leadership experience

Responsibilities:
- Design and build scalable backend APIs
- Lead technical architecture decisions
- Mentor junior developers
- Optimize database performance
```

4. Click **"Tailor Resume"**

**Expected Results**:
- ✅ Match score appears (should be 80%+)
- ✅ Tailored resume appears in right panel
- ✅ Download button becomes active
- ✅ Can download TXT file

---

### 5. **Dashboard & Role-Based UI** ✅ SHOULD NOW WORK
After logging in:
1. **Student**: Should see "Resume Scanner", "Career Check", "Find Mentors"
2. **Mentor**: Should see "My Sessions", "Student Requests"
3. **Organisation**: Should see "Post Jobs", "Find Talent"

---

## 📋 Error Checklist

If you encounter errors, check:

### ❌ "Unsupported provider: provider is not enabled"
**Solution**: Verify `.env` has correct Supabase anon key
```bash
# Current setting:
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
✅ Already fixed in this session

### ❌ "Failed to get backend token"
**Solution**: Backend `/api/v1/auth/get-token` may not be responding
- Check http://localhost:8000/docs
- Look for `/api/v1/auth/get-token` endpoint
- Check backend terminal for errors

### ❌ Tailor Resume: "invalid error"
**Solution**: Check GROQ API key in `backend/.env`
```bash
GROQ_API_KEY=gsk_xxxxxxx...  # Check your backend/.env file
```
✅ Already configured

### ❌ "Database connection failed"
**Solution**: Check `backend/.env` has Supabase connection:
```bash
SQLALCHEMY_DATABASE_URI=postgresql+asyncpg://postgres.qgncpqjntwapfvvuhmog:postgres@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```
✅ Already configured

---

## 🔧 Quick Troubleshooting

### Clear Browser Cache
If you see stale data:
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Check Backend Logs
Watch the backend terminal (port 8000) for errors

### Restart Services
If something breaks:
1. Kill both terminals (Ctrl+C)
2. Run backend again
3. Run frontend again

---

## 📊 What to Test

- [ ] Google Sign-In works
- [ ] Email Sign-Up works
- [ ] Email Sign-In works
- [ ] Dashboard loads after login
- [ ] Resume Tailor produces match score
- [ ] Resume can be downloaded
- [ ] Role-based UI shows correct buttons
- [ ] Can navigate to different pages

---

## ✅ When All Tests Pass

1. **Verify no errors** in backend terminal
2. **Verify no errors** in browser console (F12)
3. Run: `npm run build` (should succeed)
4. Stage changes: `git add -A`
5. Commit: `git commit -m "test: verified all features working locally"`
6. Push: `git push origin main`

---

## 🚀 Configuration Summary

### Frontend (.env)
✅ Supabase URL: Correct
✅ Supabase Anon Key: **JUST FIXED**
✅ API URL: http://localhost:8000

### Backend (.env)
✅ GROQ API Key: Set
✅ Supabase URL: Set
✅ Supabase Service Key: Set
✅ Database: Connected to Supabase
✅ CORS Origins: Includes localhost:8080

---

**Happy Testing! 🎉**
