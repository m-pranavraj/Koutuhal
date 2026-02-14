# 🚀 The "Zero Dollars" Deployment Deep Dive

This guide provides exactly what you need to go live for **FREE**. 

---

## Step 1: Push Code to GitHub (Prerequisite)
Managed platforms like Vercel and Render need your code on GitHub to deploy.

1.  **Create a New Repository**: Go to [GitHub](https://github.com/new) and create a **PRIVATE** repository named `koutuhal-pathways`.
2.  **Initialize & Push**: Run these commands in your project root:
    ```bash
    git init
    git add .
    git commit -m "initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/koutuhal-pathways.git
    git push -u origin main
    ```
    > [!IMPORTANT]
    > I have already updated your `.gitignore` to ensure your local `.env` files are NOT pushed to GitHub. Your keys stay safe on your computer.

---

## Step 2: Deploy the Backend (Render.com)
We use Render for the Python/FastAPI backend.

1.  **Log in to [Render](https://dashboard.render.com/)** and click **New > Web Service**.
2.  **Connect GitHub**: Connect your repo and select the `koutuhal-pathways` repository.
3.  **Settings**:
    - **Name**: `koutuhal-backend`
    - **Environment**: `Python 3`
    - **Build Command**: `cd backend && pip install -r requirements.txt`
    - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
    - **Plan**: Select **Free**.
4.  **Environment Variables**: Click "Advanced" or the "Environment" tab after creation. **This is where you paste your keys.**

### 🔑 Keys to Paste in Render:
Add these one by one:
- `POSTGRES_USER`: (From your Supabase DB settings)
- `POSTGRES_PASSWORD`: (Your Supabase DB password)
- `POSTGRES_SERVER`: (Something like `aws-0-us-east-1.pooler.supabase.com`)
- `POSTGRES_PORT`: `5432`
- `POSTGRES_DB`: `postgres`
- `SECRET_KEY`: (Generate a random string, e.g., `openssl rand -hex 32`)
- `GROQ_API_KEY`: `gsk_...`
- `SUPABASE_URL`: `https://...supabase.co`
- `SUPABASE_SERVICE_KEY`: `eyJhbGciOi...`
- `SEARCHAPI_KEY`: `QBUCwTe...`

---

## Step 3: Deploy the Frontend (Vercel)
Vercel is the fastest way to deploy the React frontend.

1.  **Log in to [Vercel](https://vercel.com/)** and click **Add New > Project**.
2.  **Import Repo**: Select `koutuhal-pathways`.
3.  **Settings**:
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
    - **Root Directory**: `./` (Leave as default)
4.  **Environment Variables**:
    - You don't actually need many here because of the `vercel.json` proxy I created, but it's good practice to add:
    - `VITE_API_URL`: (Paste the link Render gives you after Step 2, e.g., `https://koutuhal-backend.onrender.com`)

---

## Step 4: Final Linkage (CORS)

Once Vercel gives you your live URL (e.g., `https://koutuhal.vercel.app`):

1.  **Go back to Render Settings**.
2.  Add/Update the variable `BACKEND_CORS_ORIGINS`.
3.  Value: `["https://your-vercel-app.vercel.app", "http://localhost:5173"]` (Use your actual Vercel link).

---

## Summary Checklist
- [ ] Push to GitHub Private Repo.
- [ ] Create Render Web Service (Free).
- [ ] Paste 10+ keys into Render Environment tab.
- [ ] Create Vercel Project.
- [ ] Add Vercel link to Render's CORS list.

**You are now LIVE!** 🎉
