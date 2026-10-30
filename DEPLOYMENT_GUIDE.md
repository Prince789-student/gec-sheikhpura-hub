# GEC Sheikhpura Hub — Deployment & Account Configuration Guide

**Project Owner & Designated Super Admin:**
- **Email:** `pk3334238@gmail.com`
- **Owner Name:** Prince Kumar (riyanshi . Prince)
- **Role:** Full Platform Super Admin & Owner (GitHub, Firebase, Vercel, Render)

---

## 🚀 Step 1: Push Repository to GitHub (Account: pk3334238@gmail.com)

1. Open [GitHub](https://github.com/new) and sign in with **pk3334238@gmail.com**.
2. Create a new repository:
   - **Repository Name:** `gec-sheikhpura-hub`
   - **Visibility:** Public or Private (any)
   - **Initialize repository:** Do NOT check README, .gitignore or license (we already have them prepared locally).
3. Copy the repository URL (e.g., `https://github.com/<YOUR-USERNAME>/gec-sheikhpura-hub.git`).
4. Run in your terminal / PowerShell:
   ```powershell
   cd "c:\Users\princ\OneDrive\Pictures\Desktop\my poject\beu all unofficaial college\gec sheikhpura"
   git remote add origin https://github.com/<YOUR-USERNAME>/gec-sheikhpura-hub.git
   git branch -M main
   git push -u origin main
   ```

---

## ⚡ Step 2: Deploy Backend to Render (Account: pk3334238@gmail.com)

1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in with **pk3334238@gmail.com** (or click **Continue with GitHub**).
2. Click **New +** -> **Web Service**.
3. Select your `gec-sheikhpura-hub` repository.
4. Fill in the details:
   - **Name:** `gec-sheikhpura-backend`
   - **Region:** Singapore (or closest)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `ADMIN_EMAIL` = `pk3334238@gmail.com`
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
6. Click **Deploy Web Service**.
   - Your live backend will be accessible at: `https://gec-sheikhpura-backend.onrender.com`
   - Health endpoint: `https://gec-sheikhpura-backend.onrender.com/health`

---

## 🌐 Step 3: Deploy Frontend to Vercel (Account: pk3334238@gmail.com)

1. Go to [Vercel](https://vercel.com/new) and log in with **pk3334238@gmail.com** (or click **Continue with GitHub**).
2. Click **Add New...** -> **Project**.
3. Select and import `gec-sheikhpura-hub`.
4. Configure Project:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (Leave default root)
   - **Build & Output Settings:** Leave default (No build command needed — static pages and compiled Flutter Web at `/mobile_app/build/web` are pre-compiled and served automatically via `vercel.json`).
5. Click **Deploy**.
   - Your frontend will be live at: `https://gec-sheikhpura-hub.vercel.app` (or your custom Vercel subdomain).
   - The Flutter Mobile App is accessible at: `https://gec-sheikhpura-hub.vercel.app/app`
   - All `/api/*` routes are automatically proxied to Render via `vercel.json`.

---

## 🔥 Step 4: Configure Firebase under pk3334238@gmail.com (Fixes `redirect_uri_mismatch`)

The `Error 400: redirect_uri_mismatch` happens when the active domain is not in Firebase's Authorized Domains list. Follow these steps to configure Firebase completely under `pk3334238@gmail.com`:

1. Go to [Firebase Console](https://console.firebase.google.com/) signed in with **pk3334238@gmail.com**.
2. Click **Add project** -> Name it `gec-sheikhpura-hub`.
3. In the left sidebar, click **Build** -> **Authentication** -> **Get Started**.
4. In the **Sign-in method** tab:
   - Select **Google** -> Click **Enable**.
   - Project public-facing name: `GEC Sheikhpura Student Hub`
   - Project support email: `pk3334238@gmail.com`
   - Click **Save**.
5. In the **Settings** tab of Authentication -> **Authorized domains**:
   - Click **Add domain** and add:
     - `localhost`
     - `<your-project-name>.vercel.app`
     - `gec-sheikhpura-backend.onrender.com`
6. For Android / Flutter App:
   - In Firebase Console -> **Project Settings** (gear icon) -> **General**.
   - Under **Your apps**, click the **Android** icon.
   - Package name: `com.gecsheikhpura.gec_student_hub`
   - SHA-1 Fingerprint:
     `AB:86:DA:0E:D7:E3:7A:FC:87:46:8E:27:B2:D4:4A:8B:BC:8D:2A:0A`
   - SHA-256 Fingerprint:
     `C9:44:2C:86:C4:66:FA:98:2B:BC:03:4A:BE:47:76:01:F4:85:7D:22:2E:F0:91:27:93:84:87:0D:5D:92:80:CC`
   - Click **Register app** and download `google-services.json`.
   - Place `google-services.json` inside:
     `beu all unofficaial college/gec sheikhpura/mobile_app/android/app/google-services.json`
