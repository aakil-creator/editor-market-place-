# Editor Marketplace - Deployment & Packaging Guide

This guide explains how to package and deploy the **Editor Marketplace** application across various hosting environments.

---

## 1. Quick Local / Development Run

The application is configured to run on port `8001` (or any custom port):

```powershell
# In PowerShell:
.\backend\start_editor_marketplace.ps1 -Port 8001
```

Or using standard Uvicorn directly:
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Access at: `http://localhost:8001`

---

## 2. Docker Deployment

### Build the Docker Image
```bash
docker build -t editor-marketplace:latest .
```

### Run the Container
```bash
docker run -d \
  -p 8000:8000 \
  -e PORT=8000 \
  -e SECRET_KEY=your-secure-secret-key-here \
  --name editor-marketplace \
  editor-marketplace:latest
```

Access at: `http://localhost:8000`

---

## 3. Docker Compose Deployment (Recommended for Production)

Run the full stack with persistent volume storage:

```bash
docker-compose up -d --build
```

To view logs:
```bash
docker-compose logs -f
```

To stop:
```bash
docker-compose down
```

---

## 4. Cloud Deployments

### Render
1. Push the repository to GitHub / GitLab.
2. In the Render Dashboard, select **New -> Blueprint** and connect your repository.
3. Render will read [render.yaml](file:///c:/Users/Aaqil/EditorMarketplace/render.yaml) automatically:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Health Check Path: `/health`

### Railway / Heroku
The included [Procfile](file:///c:/Users/Aaqil/EditorMarketplace/Procfile) is ready for deployment:
```
web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## 5. Healthcheck Endpoints

Both endpoints check database connectivity:
- `GET /health` (Root endpoint)
- `GET /api/health` (API endpoint)

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-09-21T12:00:00.000000",
  "service": "EditorMarketplace API"
}
```
