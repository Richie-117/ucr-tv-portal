# Production Deployment Guide: Supabase + GitHub + Render

This guide provides step-by-step instructions to deploy the **University College of Rathmalana (UCR) Student Portal & List Generator** to production on **Render** with **Supabase PostgreSQL & Cloud Storage**.

---

## Architecture Overview

- **Frontend & Server**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Cloud Storage**: Supabase Storage (`portal-media` bucket) for avatars and gallery images
- **Hosting**: Render Web Service (Free Tier compatible)
- **Fallback**: Zero-downtime automatic fallback to local JSON database (`data/db.json`) if cloud credentials are unset or degraded.

---

## 1. Supabase Setup (Database & Storage)

### Step 1.1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Click **New Project**, choose a region close to your users (e.g., `Southeast Asia (Singapore)` or `South Asia (Mumbai)`), and set a secure database password.

### Step 1.2: Run SQL Schema Migrations
1. In the Supabase Dashboard, open **SQL Editor** from the left navigation.
2. Open and run [`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/user/Desktop/ucr_portal/supabase/migrations/001_initial_schema.sql). This creates:
   - Tables: `admins`, `students`, `learning_stages`, `modules`, `gallery`, `events`, `lecturers`.
   - Appropriate indexes, constraints, and Row Level Security (RLS) policies.
   - Storage bucket: `portal-media` (public read, 15MB file limit, images + PDF).
3. Open and run [`supabase/migrations/002_timetables_schema.sql`](file:///c:/Users/user/Desktop/ucr_portal/supabase/migrations/002_timetables_schema.sql). This creates:
   - Tables: `timetables`, `timetable_overrides`.
   - Indexes for fast querying by category, course, and date.
   - Row Level Security (RLS) policies allowing public read of published timetables and active overrides.
4. Open and run [`supabase/migrations/003_settings_and_storage_fix.sql`](file:///c:/Users/user/Desktop/ucr_portal/supabase/migrations/003_settings_and_storage_fix.sql). This creates:
   - Table: `site_settings` for dynamic section headers and configurations.
   - Updates `portal-media` bucket rules for PDF uploads.

### Step 1.3: Retrieve API Keys
1. Go to **Project Settings** -> **API**.
2. Note down:
   - **Project URL** (e.g., `https://xyzabc.supabase.co`)
   - **anon / public key**
   - **service_role key** (Secret server-side key - never expose this to client code!)

---

## 2. Data Migration (Local JSON -> Supabase)

To migrate all existing 58+ student records, modules, stages, events, gallery items, and admin accounts without duplicate keys or data loss:

### Option A: Via Command Line (Recommended)
Add your Supabase credentials to `.env.local` or provide them inline:

```bash
# Set your keys
set SUPABASE_URL=https://your-project-ref.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Run the migration
npm run migrate
```

### Option B: Via Admin API
1. Log in to the Admin Dashboard (`/admin/login`).
2. Make an authenticated POST request to `/api/admin/migrate` using your browser console or curl:
   ```bash
   curl -X POST http://your-domain.com/api/admin/migrate -b "ucr_auth_token=..."
   ```

*Note: The original `data/db.json` file is preserved intact as a permanent local backup.*

---

## 3. GitHub Repository Setup

1. Check that `.gitignore` is in place (already configured to ignore `.env*`, `node_modules`, and `.next`).
2. Commit and push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Add Tools feature, Supabase data layer, and production readiness"
   git branch -M main
   git remote add origin https://github.com/your-username/ucr_portal.git
   git push -u origin main
   ```

---

## 4. Render Web Service Deployment

### Step 4.1: Create Web Service
1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repo `ucr_portal`.

### Step 4.2: Configure Build and Start Settings
- **Name**: `ucr-student-portal`
- **Region**: Choose matching region (e.g., Singapore)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Start Command**:
  ```bash
  npm run start
  ```
  *(Note: `package.json` configures `next start -H 0.0.0.0`, which binds to Render's assigned port and host automatically)*
- **Instance Type**: `Free`

### Step 4.3: Set Environment Variables on Render
Under **Environment Variables**, add:

| Key | Example / Description |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(Render sets this automatically)* |
| `HOSTNAME` | `0.0.0.0` |
| `JWT_SECRET` | Strong 32+ character random string |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your secret `service_role` key from Supabase |
| `SUPABASE_ANON_KEY` | Your public `anon` key from Supabase |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_EMAIL` | `admin@ucr.ac.lk` |
| `ADMIN_PASSWORD` | Strong password for initial admin setup |

Click **Create Web Service**.

---

## 5. Verification & Health Check

Once deployed, verify:
1. **Health Check**:
   Visit `https://<your-service>.onrender.com/health` (or `/api/health`).
   Expected response:
   ```json
   {
     "status": "healthy",
     "database": {
       "configured": "supabase",
       "status": "ok"
     },
     "storage": "supabase",
     "metrics": {
       "totalStudents": 58,
       "totalModules": 6,
       "totalEvents": 3
     }
   }
   ```
2. **Tools Page**:
   Visit `https://<your-service>.onrender.com/tools` and test student list generation and PDF download.
3. **Admin Dashboard Persistence**:
   Log in at `/admin/login`, update or add a test record, and verify changes persist after service restart.
