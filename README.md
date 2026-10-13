# PulseAI — AI-Powered Emotion Intelligence Platform

> **Paper & Pulse — Emotion Intelligence, Made Clear.**  
> A full-stack web platform for analyzing customer feedback, product reviews, and survey datasets using transformer AI emotion classification.

---

## 🚀 Architecture Overview

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Recharts, Lucide React, Axios.
- **Backend:** FastAPI, Python 3.11+, PyTorch (Inference Mode), Hugging Face Transformers (`j-hartmann/emotion-english-distilroberta-base`), Pandas, SQLite.
- **Taxonomy:** 7 affective categories: `Joy`, `Sadness`, `Anger`, `Fear`, `Surprise`, `Disgust`, `Neutral`.

---

## 🛠️ Local Development Setup

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend will be live at `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://127.0.0.1:5173`.

---

## 🌐 How to Deploy This Project

You can deploy PulseAI using any of the following standard production patterns:

---

### Option 1: Vercel (Frontend) + Render / Railway (Backend) — *Recommended & Easiest*

#### Step 1: Deploy Backend to Render or Railway
1. Push your repository to **GitHub**.
2. Go to [Render.com](https://render.com) (or [Railway.app](https://railway.app)).
3. Click **New Web Service** and select your GitHub repository.
4. Set:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `PORT`: `8000`
   - `CORS_ORIGINS`: `https://your-frontend-app.vercel.app`
   - `EMOTION_MODEL_NAME`: `j-hartmann/emotion-english-distilroberta-base`
6. Deploy the service and copy your public backend URL (e.g. `https://pulseai-api.onrender.com`).

#### Step 2: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Root Directory:** Click `Edit` and select `frontend`.
   - **Framework Preset:** `Vite`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://pulseai-api.onrender.com/api` (use your deployed backend URL from Step 1).
5. Click **Deploy**. Your PulseAI web app is now live!

---

### Option 2: Single Server / VPS with Docker Compose (DigitalOcean, AWS, Hetzner, Linode)

Both frontend and backend can be deployed together on any VPS with Docker installed:

1. SSH into your VPS:
   ```bash
   ssh root@your-server-ip
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/Pulse_AI_Dashboard.git
   cd Pulse_AI_Dashboard
   ```
3. Run with Docker Compose:
   ```bash
   docker compose up -d --build
   ```
4. Done!
   - Frontend is served on port `80` (or behind Nginx/Certbot for SSL).
   - Backend API is connected internally and on port `8000`.

---

### Option 3: Hugging Face Spaces (Backend) + Vercel (Frontend)

Because the backend uses a Hugging Face transformer model, Hugging Face Spaces provides free CPU/GPU hosting:

1. On [HuggingFace.co](https://huggingface.co), create a new **Space**.
2. Select **FastAPI / Docker** as the SDK.
3. Upload the contents of the `backend/` directory.
4. Your API endpoint will be: `https://your-username-pulseai-backend.hf.space/api`.
5. Point your Vercel frontend `VITE_API_BASE_URL` to that URL.

---

## 🧪 Testing

To run the automated backend test suite:
```bash
python -m pytest backend/tests/test_api.py -v
```

To build and check frontend bundle:
```bash
cd frontend
npm run build
```

---

## 🔒 Security & Medical Disclaimer

PulseAI evaluates textual expressions of emotions using language model representations. It does not diagnose psychological, neurological, or medical conditions.
