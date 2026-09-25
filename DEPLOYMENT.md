# Deployment Guide — IC Verify AI

This project is configured for **Unified Production Deployment**, where a single container or service runs both the **React Frontend** and the **FastAPI Backend**, serving everything from a single URL without CORS issues.

---

## Deployment Options

### Option 1: Vercel (1-Click Frontend Deployment)
Deploy the React Vite SPA on Vercel with automatic SPA routing:

1. Click here to import directly:
   👉 **[Deploy on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frohithb1911%2FIC-Verify-AI)**
   *(Or go to [vercel.com/new](https://vercel.com/new) and select `rohithb1911/IC-Verify-AI`)*
2. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or `frontend`)
   - **Build Command**: `cd frontend && npm install && npm run build` (or leave default if configured via `vercel.json`)
   - **Output Directory**: `frontend/dist` (or `dist` if root is `frontend`)
3. Optional Environment Variables:
   - `VITE_BACKEND_URL`: URL of your deployed backend (e.g. `https://ic-verify-ai.onrender.com`). If omitted, the app will run with full built-in interactive simulation mode.
4. Click **Deploy**.

---

### Option 2: Render.com (Recommended for Full-Stack Docker Backend)
[Render](https://render.com) automatically reads [`render.yaml`](./render.yaml) or your `Dockerfile` directly from your GitHub repository.

1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository: `https://github.com/rohithb1911/IC-Verify-AI`.
3. Select **Docker** environment (or let Render detect the `Dockerfile` automatically).
4. Settings:
   - **Name**: `ic-verify-ai`
   - **Branch**: `main`
   - **Plan**: Free (or Starter)
   - **Port**: `8000` (automatically injected via `$PORT`)
5. Click **Create Web Service**.
6. Once deployed, Render provides your live URL: `https://ic-verify-ai.onrender.com`.

---

### Option 2: Railway.app (Instant Container Deploy)
[Railway](https://railway.app) can deploy the multi-stage `Dockerfile` with zero configuration.

1. Go to [railway.app](https://railway.app) and click **New Project** → **Deploy from GitHub repo**.
2. Select `rohithb1911/IC-Verify-AI`.
3. Railway will automatically build the `Dockerfile`.
4. In the service settings, click **Generate Domain** under *Networking*.
5. Your app is live!

---

### Option 3: Google Cloud Run (Serverless Container)
Using Google Cloud CLI (`gcloud`), deploy directly from source:

```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Deploy directly from Dockerfile
gcloud run deploy ic-verify-ai \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8000 \
  --memory 1Gi
```

---

### Option 4: Self-Hosted Docker / VPS (AWS, DigitalOcean, Ubuntu)
To deploy on any server with Docker installed:

```bash
# 1. Clone your repository on the server
git clone https://github.com/rohithb1911/IC-Verify-AI.git
cd IC-Verify-AI

# 2. Build and start using Docker Compose
docker compose up -d --build

# 3. View logs
docker compose logs -f
```

Your service will be accessible on `http://YOUR_SERVER_IP:8000`.

---

## Health Check & API Verification

Once deployed, you can verify your service endpoints:
- **Web Interface (SPA)**: `https://your-domain.com/`
- **Dashboard**: `https://your-domain.com/dashboard`
- **API Status**: `https://your-domain.com/api/analytics`
- **Interactive Swagger Docs**: `https://your-domain.com/docs`
- **OpenAPI JSON**: `https://your-domain.com/openapi.json`
