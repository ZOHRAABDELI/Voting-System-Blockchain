# 🚀 Deploy to Render (Both Frontend & Backend)

**Simple guide to deploy your entire blockchain voting system on Render.com for FREE!**

---

## 🎯 Why Render for Both?

- ✅ **One platform** - Manage everything in one place
- ✅ **100% FREE** - Both services on free tier
- ✅ **Easy setup** - No juggling multiple platforms
- ✅ **Auto-deploy** - Push to GitHub, auto-deploys
- ✅ **Automatic HTTPS** - Secure by default

---

## 📋 Prerequisites

- GitHub account with your code pushed
- Render account (sign up at [render.com](https://render.com))

---

## ⚡ Deployment Steps (20 Minutes Total)

### Part 1: Deploy Backend (10 minutes)

#### Step 1: Sign Up on Render

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign in with GitHub

#### Step 2: Create Backend Web Service

1. Click **"New +"** → **"Web Service"**
2. Find and click **"Connect"** next to your repository
3. Configure:

```
Name: voting-blockchain-api
Region: Oregon (US West)
Branch: main
Root Directory: (leave blank)
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn -c gunicorn_config.py app:app
Instance Type: Free
```

4. Click **"Advanced"** and add **Disk**:

```
Name: blockchain-data
Mount Path: /opt/render/project/src/data
Size: 1 GB
```

5. Click **"Create Web Service"**

6. ⏱️ Wait 5-10 minutes for deployment

7. **Copy your backend URL**: `https://voting-blockchain-api-xxxx.onrender.com`

#### Step 3: Test Backend

Open in browser:
```
https://voting-blockchain-api-xxxx.onrender.com/api/health
```

Should see:
```json
{"status":"healthy","blockchain_length":1,"pending_transactions":0}
```

---

### Part 2: Deploy Frontend (10 minutes)

#### Step 4: Build Frontend Locally

First, we need to build the React app:

```bash
cd frontend

# Update API URL for production
export REACT_APP_API_URL=https://voting-blockchain-api-xxxx.onrender.com/api

# Or on Windows:
# set REACT_APP_API_URL=https://voting-blockchain-api-xxxx.onrender.com/api

# Build the app
npm run build
```

This creates a `frontend/build` folder with static files.

#### Step 5: Create Static Site on Render

1. Go back to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect the **same repository**
4. Configure:

```
Name: voting-blockchain
Branch: main
Root Directory: frontend
Build Command: npm run build
Publish Directory: frontend/build
```

5. Add **Environment Variable**:
   - Click **"Advanced"**
   - Add Environment Variable:
     ```
     Key: REACT_APP_API_URL
     Value: https://voting-blockchain-api-xxxx.onrender.com/api
     ```
     (Use YOUR backend URL from Step 3!)

6. Click **"Create Static Site"**

7. ⏱️ Wait 3-5 minutes for deployment

8. **Copy your frontend URL**: `https://voting-blockchain-xxxx.onrender.com`

---

## 🎉 You're Live!

Your app is now deployed! You have:

- **Backend API**: `https://voting-blockchain-api-xxxx.onrender.com`
- **Frontend App**: `https://voting-blockchain-xxxx.onrender.com`

---

## ✅ Testing Your Deployment

Visit your frontend URL and test:

1. ✅ Homepage loads
2. ✅ Click "Register" → Register a voter
3. ✅ Save your voter ID and secret key
4. ✅ Click "Login" → Login with credentials
5. ✅ Click "Create Election" → Create an election
6. ✅ View elections → Click an election
7. ✅ Cast a vote
8. ✅ View results
9. ✅ Check blockchain explorer

---

## 🔄 Auto-Deploy on Git Push

Both services auto-deploy when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Render automatically rebuilds and deploys!
```

---

## 📊 Your Render Dashboard

Access everything at: https://dashboard.render.com

You'll see:
- **voting-blockchain-api** (Web Service) - Backend
- **voting-blockchain** (Static Site) - Frontend

Click each to view:
- Logs
- Environment variables
- Deploy history
- Settings

---

## ⚠️ Important Notes

### Backend Sleeping (Free Tier)
- Backend **sleeps after 15 minutes** of inactivity
- **First request wakes it up** (~30 seconds)
- Subsequent requests are instant
- This is normal for Render free tier!

**Solution**: Use [UptimeRobot](https://uptimerobot.com) (free) to ping your backend every 14 minutes to keep it awake.

### Frontend is Always Fast
- Static sites **don't sleep**
- Served from global CDN
- Always instant loading

---

## 🔧 Troubleshooting

### Issue 1: CORS Error

**Error in browser console:**
```
Access to fetch... has been blocked by CORS policy
```

**Fix**: Backend may be sleeping (first load). Wait 30 seconds and refresh.

---

### Issue 2: Backend Not Responding

**Test backend directly:**
```
https://voting-blockchain-api-xxxx.onrender.com/api/health
```

**If it takes 30+ seconds**: Backend was sleeping (normal)
**If it fails**: Check Render logs:
1. Dashboard → voting-blockchain-api → Logs
2. Look for errors in red

---

### Issue 3: Frontend Shows Old Version

**Fix**: Hard refresh
- Chrome/Edge: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- Or clear browser cache

---

### Issue 4: Environment Variable Not Working

**Check**:
1. Dashboard → voting-blockchain (Static Site)
2. Environment → Check `REACT_APP_API_URL`
3. Should be: `https://voting-blockchain-api-xxxx.onrender.com/api`
4. If wrong, update and trigger manual deploy

---

## 🔍 Checking Logs

### Backend Logs
1. Dashboard → voting-blockchain-api
2. Click "Logs" tab
3. View real-time logs

Look for:
```
Loading blockchain data...
✓ Blockchain loaded: X blocks
Server running on port 10000
```

### Frontend Build Logs
1. Dashboard → voting-blockchain
2. Click latest deployment
3. View build logs

Look for:
```
Installing dependencies...
Creating optimized build...
Build completed successfully
```

---

## 💰 Cost

| Service | Cost | Usage |
|---------|------|-------|
| Backend Web Service | **$0** | 750 hours/month |
| Frontend Static Site | **$0** | 100GB bandwidth |
| Persistent Disk | **$0** | 1GB included |
| **TOTAL** | **$0/month** | Perfect! |

---

## 📱 Custom Domain (Optional)

Want your own domain? (e.g., `voting.yourdomain.com`)

1. Dashboard → Your service → Settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records as shown
5. Free HTTPS included!

---

## 🎯 Quick Reference

### Your URLs
```
Backend:  https://voting-blockchain-api-[ID].onrender.com
Frontend: https://voting-blockchain-[ID].onrender.com
```

### Important Paths
```
Health Check: /api/health
Register:     /api/voters/register
Elections:    /api/elections
Vote:         /api/elections/{id}/vote
Blockchain:   /api/blockchain
```

### Test Commands
```bash
# Test backend
curl https://voting-blockchain-api-xxxx.onrender.com/api/health

# Test frontend
curl https://voting-blockchain-xxxx.onrender.com
```

---

## 🔄 Update Your App

### Update Backend
```bash
# Make changes to Python code
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys backend
```

### Update Frontend
```bash
# Make changes to React code in frontend/
git add .
git commit -m "Update frontend"
git push origin main
# Render auto-deploys frontend
```

---

## 📊 Monitoring

### Set Up UptimeRobot (Recommended)

Keep your backend awake:

1. Go to **https://uptimerobot.com** (free)
2. Sign up and create monitor:
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Voting Backend
   URL: https://voting-blockchain-api-xxxx.onrender.com/api/health
   Monitoring Interval: 14 minutes
   ```
3. Save

Your backend will now stay awake 24/7!

---

## ✅ Success Checklist

After deployment:

- [ ] Backend URL is live and returns JSON at `/api/health`
- [ ] Frontend URL loads the homepage
- [ ] Can register a voter
- [ ] Can login with credentials
- [ ] Can create an election
- [ ] Can cast a vote
- [ ] Results display correctly
- [ ] Blockchain explorer works
- [ ] Mobile responsive (test on phone)
- [ ] No console errors (F12 → Console)

---

## 🎓 What You've Accomplished

✅ Deployed a **full-stack blockchain application**
✅ Backend API with persistent storage
✅ Modern React frontend with Tailwind CSS
✅ Automatic HTTPS and security
✅ Auto-deploy on git push
✅ All for **$0/month**

---

## 🆘 Need Help?

1. **Check Logs**: Dashboard → Service → Logs
2. **Test Backend**: `https://your-backend.onrender.com/api/health`
3. **Hard Refresh**: Clear browser cache
4. **Redeploy**: Dashboard → Manual Deploy
5. **Wait**: Backend may be waking up (30 seconds)

---

## 📚 Next Steps

1. **Share**: Send your frontend URL to friends/instructor
2. **Portfolio**: Add to your resume/LinkedIn
3. **Monitor**: Set up UptimeRobot
4. **Improve**: Add features and auto-deploy!
5. **Learn**: Check logs to understand how it works

---

## 🎉 Congratulations!

Your blockchain voting system is now **live on the internet**!

**Share your app:**
- Frontend: `https://voting-blockchain-[ID].onrender.com`
- Backend API: `https://voting-blockchain-api-[ID].onrender.com`

**You can now:**
- 🗳️ Let anyone vote in your elections
- 📊 Display real-time results
- 🔗 Show off your blockchain knowledge
- 💼 Add to your portfolio
- 🎓 Demo in your presentation

Happy voting! 🎉✨

---

## 📖 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [GitHub Deployments](https://docs.github.com/en/actions)

**Main Project Documentation:**
- [README.md](README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [PERSISTENCE.md](PERSISTENCE.md)
