# 🎯 Render-Only Deployment - Quick Guide

**Deploy both frontend and backend on Render in under 20 minutes!**

---

## ⚡ Super Quick Steps

### 1️⃣ Deploy Backend (5 min)

**Go to**: https://render.com → Sign in with GitHub

**Create Web Service**:
- Repository: Your repo
- Name: `voting-blockchain-api`
- Build: `pip install -r requirements.txt`
- Start: `gunicorn -c gunicorn_config.py app:app`
- Add Disk: `/opt/render/project/src/data` (1GB)

**Copy URL**: `https://voting-blockchain-api-xxxx.onrender.com`

---

### 2️⃣ Build Frontend Locally (2 min)

```bash
cd frontend

# Set API URL (use YOUR backend URL!)
export REACT_APP_API_URL=https://voting-blockchain-api-xxxx.onrender.com/api

# Build
npm run build
```

---

### 3️⃣ Deploy Frontend (3 min)

**Create Static Site on Render**:
- Same repository
- Name: `voting-blockchain`
- Root Directory: `frontend`
- Build: `npm run build`  
- Publish: `frontend/build`
- Environment Variable:
  - `REACT_APP_API_URL` = `https://voting-blockchain-api-xxxx.onrender.com/api`

---

### 4️⃣ Test! (2 min)

Visit: `https://voting-blockchain-xxxx.onrender.com`

- ✅ Register voter
- ✅ Create election
- ✅ Cast vote
- ✅ View results

---

## 🎉 Done!

**Your URLs:**
- Frontend: `https://voting-blockchain-xxxx.onrender.com`
- Backend: `https://voting-blockchain-api-xxxx.onrender.com`

**Cost**: $0/month

**Auto-deploy**: Push to GitHub → Auto-deploys both!

---

## ⚠️ Important

**Backend sleeps after 15 minutes** (free tier)
- First request: ~30 seconds (wakes up)
- After that: instant

**Keep it awake**: Use [UptimeRobot](https://uptimerobot.com) (free) to ping every 14 minutes

---

## 🆘 Troubleshooting

**CORS Error?** → Backend sleeping, wait 30 seconds

**Frontend not updating?** → Hard refresh (Ctrl+Shift+R)

**Build failed?** → Check logs in Render dashboard

---

**Full Guide**: See [DEPLOY_RENDER_ONLY.md](DEPLOY_RENDER_ONLY.md)

Happy deploying! 🚀
