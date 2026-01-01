# 🚀 Free Deployment Guide

Complete guide to deploy your Blockchain Voting System for **FREE** using modern cloud platforms.

## 📋 Overview

**Recommended Free Hosting Stack:**
- **Backend (Flask API)**: Render.com (Free Tier)
- **Frontend (React)**: Vercel or Netlify (Free Tier)
- **Total Cost**: $0/month

## 🔧 Backend Deployment (Render.com)

### Why Render?
- ✅ Free tier with 750 hours/month
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ✅ Easy Python/Flask support
- ✅ Persistent disk available

### Step 1: Prepare Backend for Deployment

#### 1.1 Create `render.yaml`

Create this file in the root directory:

```yaml
services:
  - type: web
    name: voting-blockchain-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
```

#### 1.2 Update `requirements.txt`

Add production dependencies:

```txt
Flask==3.0.0
Flask-CORS==4.0.0
gunicorn==21.2.0
```

#### 1.3 Create `gunicorn_config.py`

```python
# Gunicorn configuration file
bind = "0.0.0.0:5000"
workers = 2
threads = 2
timeout = 120
```

#### 1.4 Update `app.py` for Production

Add at the end of `app.py`:

```python
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False') == 'True'
    
    print("Starting Blockchain Voting System API Server...")
    print(f"Server running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
```

### Step 2: Deploy to Render

1. **Sign up** at [render.com](https://render.com)

2. **Connect GitHub**: Link your GitHub account

3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your repository
   - Name: `voting-blockchain-api`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

4. **Configure Environment**:
   - Instance Type: `Free`
   - Advanced → Add Disk:
     - Mount Path: `/opt/render/project/src/data`
     - Size: 1GB (for persistent storage)

5. **Deploy**: Click "Create Web Service"

6. **Get API URL**: Copy your URL (e.g., `https://voting-blockchain-api.onrender.com`)

### Step 3: Test Backend

```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "blockchain_length": 1,
  "pending_transactions": 0
}
```

---

## 🎨 Frontend Deployment (Vercel)

### Why Vercel?
- ✅ Completely free for personal projects
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploy from GitHub
- ✅ Perfect for React apps

### Step 1: Prepare Frontend for Deployment

#### 1.1 Update API URL

Edit `frontend/src/api.js`:

```javascript
import axios from 'axios';

// Use environment variable or fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-app.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

#### 1.2 Create `.env.production` in `frontend/`

```env
REACT_APP_API_URL=https://voting-blockchain-api.onrender.com/api
```

#### 1.3 Create `vercel.json` in `frontend/`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Follow prompts**:
   - Set up and deploy? `Y`
   - Scope: (Select your account)
   - Link to existing project? `N`
   - Project name: `voting-blockchain`
   - Directory: `./`
   - Override settings? `N`

#### Option B: Deploy via Vercel Dashboard

1. **Sign up** at [vercel.com](https://vercel.com)

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Environment Variables**:
   - Add: `REACT_APP_API_URL` = `https://voting-blockchain-api.onrender.com/api`

4. **Deploy**: Click "Deploy"

5. **Get URL**: Copy your URL (e.g., `https://voting-blockchain.vercel.app`)

### Step 3: Test Frontend

Visit your Vercel URL and test:
- ✅ Registration works
- ✅ Elections load
- ✅ Voting works
- ✅ Blockchain explorer works

---

## 🔄 Alternative: Netlify (Frontend)

### Deploy to Netlify

1. **Sign up** at [netlify.com](https://netlify.com)

2. **Deploy**:
   - Drag & drop `frontend/build` folder, OR
   - Connect GitHub repository

3. **Build Settings**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`

4. **Environment Variables**:
   - `REACT_APP_API_URL` = `https://voting-blockchain-api.onrender.com/api`

5. **Deploy**: Click "Deploy site"

---

## 🔄 Alternative Backend Options

### Option 1: Railway.app

**Pros**: Great free tier, easy deployment
**Cons**: Limited free hours

1. Sign up at [railway.app](https://railway.app)
2. Create new project from GitHub
3. Deploy automatically
4. Get your URL

### Option 2: PythonAnywhere

**Pros**: Python-focused, persistent storage
**Cons**: More manual setup

1. Sign up at [pythonanywhere.com](https://www.pythonanywhere.com)
2. Upload code via Git
3. Configure WSGI
4. Set up Flask app

### Option 3: Fly.io

**Pros**: Good performance, global deployment
**Cons**: Credit card required (even for free tier)

1. Install Fly CLI
2. Run `fly launch`
3. Deploy with `fly deploy`

---

## 📝 Complete Deployment Checklist

### Backend (Render)
- [ ] Create `gunicorn_config.py`
- [ ] Update `requirements.txt` with gunicorn
- [ ] Update `app.py` for production
- [ ] Push code to GitHub
- [ ] Create Render account
- [ ] Create Web Service on Render
- [ ] Add persistent disk for data/
- [ ] Configure environment variables
- [ ] Deploy and verify
- [ ] Test API endpoints
- [ ] Copy backend URL

### Frontend (Vercel/Netlify)
- [ ] Update `frontend/src/api.js` with API URL
- [ ] Create `.env.production` with backend URL
- [ ] Create `vercel.json` or `netlify.toml`
- [ ] Push code to GitHub
- [ ] Create Vercel/Netlify account
- [ ] Import GitHub repository
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Deploy and verify
- [ ] Test all features

### Final Testing
- [ ] Register a voter
- [ ] Create an election
- [ ] Cast votes
- [ ] View results
- [ ] Check blockchain explorer
- [ ] Test on mobile
- [ ] Verify CORS is working
- [ ] Check persistent storage

---

## 🔐 CORS Configuration for Production

Update `app.py` CORS settings:

```python
from flask_cors import CORS

# Update CORS for production
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",  # Development
            "https://voting-blockchain.vercel.app",  # Production frontend
            "https://*.vercel.app",  # All Vercel preview deployments
        ]
    }
})
```

---

## 🌐 Custom Domain (Optional)

### For Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation

### For Render (Backend)
1. Go to Settings → Custom Domains
2. Add your custom domain
3. Update DNS records
4. Enable automatic HTTPS

---

## 📊 Monitoring & Logs

### Render Logs
- Dashboard → Your Service → Logs
- View real-time logs
- Debug errors

### Vercel Logs
- Project → Deployments → Click deployment → Logs
- View build and runtime logs

---

## 💰 Cost Breakdown

| Service | Free Tier | Limits |
|---------|-----------|---------|
| **Render** | ✅ Free | 750 hours/month, 512MB RAM |
| **Vercel** | ✅ Free | 100 GB bandwidth/month |
| **Netlify** | ✅ Free | 100 GB bandwidth/month |
| **Total** | **$0/month** | Perfect for demo/testing |

### When to Upgrade?

- **High Traffic**: Consider paid tiers
- **24/7 Uptime**: Render free tier sleeps after 15 min inactivity
- **More Storage**: Upgrade for larger blockchain data

---

## 🚨 Common Issues & Fixes

### Issue 1: CORS Error

**Error**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Fix**: Update CORS in `app.py`:
```python
CORS(app, origins=["https://your-frontend.vercel.app"])
```

### Issue 2: API Not Found (404)

**Error**: Frontend can't reach backend

**Fix**: 
1. Check `REACT_APP_API_URL` in Vercel environment variables
2. Verify backend is running on Render
3. Test backend URL directly

### Issue 3: App Sleeping (Render)

**Error**: First request is slow/times out

**Fix**: 
- Render free tier sleeps after 15 minutes of inactivity
- First request wakes it up (takes ~30 seconds)
- Consider using UptimeRobot to ping every 14 minutes

### Issue 4: Data Loss

**Error**: Data disappears after restart

**Fix**:
1. Ensure persistent disk is mounted on Render
2. Check disk is mounted to `/opt/render/project/src/data`
3. Verify data is actually being saved

---

## 🎯 Quick Start Commands

### Build & Test Locally

```bash
# Backend
cd "/home/zahra/Documents/4rth Year/Block_chain/project/Voting-System-Blockchain"
pip install -r requirements.txt
python app.py

# Frontend (new terminal)
cd frontend
npm install
REACT_APP_API_URL=http://localhost:5000/api npm start
```

### Deploy Backend (Render)

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
# Then deploy on Render dashboard
```

### Deploy Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Flask Deployment](https://flask.palletsprojects.com/en/3.0.x/deploying/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Backend is accessible via HTTPS
- [ ] Frontend loads without errors
- [ ] User can register
- [ ] User can login
- [ ] Elections can be created
- [ ] Votes can be cast
- [ ] Results are displayed
- [ ] Blockchain explorer works
- [ ] Data persists after backend restart
- [ ] Mobile responsive
- [ ] No console errors

---

## 🎉 You're Live!

Congratulations! Your blockchain voting system is now deployed and accessible worldwide for **FREE**!

**Share your links**:
- 🌐 Frontend: `https://your-app.vercel.app`
- 🔌 Backend API: `https://your-app.onrender.com/api`

**Next Steps**:
1. Share with users
2. Monitor usage
3. Collect feedback
4. Iterate and improve

Happy voting! 🗳️✨
