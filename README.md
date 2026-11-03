# Juta Kapra — Frontend Client

The official client application for **Juta Kapra**, built with React 19, TypeScript, Vite, Tailwind CSS v4, Motion, and Lucide React.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the template to your local environment file:
```bash
cp .env.example .env
```
Fill in your Supabase project keys and backend URL:
- `VITE_API_BASE_URL`: Leave blank for local development (Vite automatically proxies `/api` to `http://localhost:5000`). For production on Vercel, set to your backend deployment URL.
- `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://<project-ref>.supabase.co`).
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public API Key.

### 3. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## 🛠️ Build & Production
```bash
npm run build
```
Generates a highly-optimized static bundle in `dist/`.

---

## ☁️ Deployment on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
2. Select the `Jutakapra_Frontend` GitHub repository.
3. Framework Preset: **Vite** (Root Directory: `./`).
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: Your deployed backend URL (e.g. `https://jutakapra-backend.vercel.app`)
   - `VITE_SUPABASE_URL`: `https://<project>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<anon-key>`
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID
5. Click **Deploy**.
