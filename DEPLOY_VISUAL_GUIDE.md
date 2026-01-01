# 🖼️ Visual Deployment Guide

**Step-by-step visual guide with what you'll see on each screen**

---

## 🔷 Part 1: Backend Deployment (Render.com)

### Step 1.1: Sign Up / Login to Render

**Go to**: https://render.com

**What you'll see:**
- Big blue "Get Started for Free" button
- GitHub sign-in option (recommended)

**Action**: Click "Sign in with GitHub"

---

### Step 1.2: Create New Web Service

**What you'll see:**
- Dashboard with "New +" button in top right
- Dropdown menu appears

**Action**: 
1. Click "New +" 
2. Select "Web Service" from dropdown

---

### Step 1.3: Connect Repository

**What you'll see:**
- List of your GitHub repositories
- Search bar at top
- "Connect" buttons next to each repo

**Action**: 
1. Find "Voting-System-Blockchain" repository
2. Click "Connect" button next to it

---

### Step 1.4: Configure Service

**What you'll see - Form with these fields:**

```
Name: [Enter name here]
Region: Oregon (US West)
Branch: main
Root Directory: [blank]
Environment: Python 3
Build Command: [auto-filled or blank]
Start Command: [auto-filled or blank]
```

**Fill in:**
```
Name: voting-blockchain-api
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn -c gunicorn_config.py app:app
Instance Type: Free
```

---

### Step 1.5: Add Persistent Disk

**What you'll see:**
- "Advanced" dropdown/button
- Click to expand more options

**Action:**
1. Click "Advanced"
2. Scroll to "Disks" section
3. Click "+ Add Disk"

**Fill in:**
```
Name: blockchain-data
Mount Path: /opt/render/project/src/data
Size: 1 GB
```

---

### Step 1.6: Deploy!

**What you'll see:**
- Big "Create Web Service" button at bottom
- Summary of your configuration

**Action**: 
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Watch the logs scroll by

**Deployment logs will show:**
```
==> Building...
Collecting Flask==3.0.0
Installing collected packages...
Successfully installed Flask-3.0.0 ...

==> Starting service...
Loading blockchain data...
✓ Starting with fresh blockchain
Server running on port 10000
```

---

### Step 1.7: Get Your Backend URL

**What you'll see:**
- Green "Live" badge at top
- Your URL displayed prominently
- Example: `https://voting-blockchain-api-abc123.onrender.com`

**Action**: 
1. **COPY THIS URL** - you'll need it for frontend!
2. Test it: Open `https://your-url.onrender.com/api/health`
3. Should see: `{"status":"healthy","blockchain_length":1,...}`

---

## 🔷 Part 2: Frontend Deployment (Vercel)

### Step 2.1: Update API URL

**Before deploying frontend, update the backend URL**

**On your computer:**
1. Open: `frontend/.env.production`
2. Update line:
   ```env
   REACT_APP_API_URL=https://voting-blockchain-api-abc123.onrender.com/api
   ```
3. Save file
4. Commit to git:
   ```bash
   git add .
   git commit -m "Update production API URL"
   git push origin main
   ```

---

### Step 2.2: Sign Up / Login to Vercel

**Go to**: https://vercel.com

**What you'll see:**
- "Start Deploying" or "Sign Up" button
- GitHub sign-in option (recommended)

**Action**: Click "Continue with GitHub"

---

### Step 2.3: Import Project

**What you'll see:**
- Dashboard with "Add New..." button
- Dropdown menu

**Action**: 
1. Click "Add New..."
2. Select "Project"
3. Click "Import" on your repository

---

### Step 2.4: Configure Project

**What you'll see - Form with these sections:**

**Import Git Repository:**
```
Repository: Voting-System-Blockchain
```

**Configure Project:**
```
Framework Preset: [auto-detected or dropdown]
Root Directory: ./
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

**YOU MUST CHANGE:**
```
Root Directory: frontend
```

**Leave others as default**

---

### Step 2.5: Add Environment Variables

**What you'll see:**
- "Environment Variables" section
- "Add" button or input fields

**Action**: Click "Add" or enter:
```
Name: REACT_APP_API_URL
Value: https://voting-blockchain-api-abc123.onrender.com/api
```

(Use YOUR backend URL from Step 1.7!)

---

### Step 2.6: Deploy!

**What you'll see:**
- Big "Deploy" button at bottom
- Summary of configuration

**Action**: 
1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Watch build logs

**Build logs will show:**
```
Installing dependencies...
Building...
Creating an optimized production build...
Compiled successfully!
✓ Build completed
```

---

### Step 2.7: Get Your Frontend URL & Test

**What you'll see:**
- Confetti animation 🎉
- "Congratulations!" message
- Your live URL
- Example: `https://voting-blockchain.vercel.app`

**Action**: 
1. Click "Visit" or copy URL
2. **YOUR APP IS LIVE!** 🚀

**Test the app:**
```
✅ Homepage loads
✅ Click "Register"
✅ Enter name and email
✅ Save voter credentials
✅ Login with credentials
✅ Create an election
✅ Vote on the election
✅ View results
✅ Check blockchain explorer
```

---

## 🎯 Success Indicators

### Backend (Render) - You know it worked when:
- ✅ Status shows "Live" with green dot
- ✅ Logs show "Server running on port 10000"
- ✅ Opening `/api/health` shows JSON response
- ✅ No red error messages in logs

### Frontend (Vercel) - You know it worked when:
- ✅ Build status shows "Ready"
- ✅ Visiting URL shows your voting app
- ✅ No console errors (F12 → Console tab)
- ✅ Can register and login

---

## ❌ Common Issues & What You'll See

### Issue 1: CORS Error

**What you'll see in browser console (F12):**
```
Access to fetch at 'https://...' from origin 'https://...' 
has been blocked by CORS policy
```

**Fix:**
- Backend is running but CORS needs updating
- Check that frontend URL is allowed in backend CORS settings
- Or update backend `app.py` to allow all origins temporarily:
  ```python
  CORS(app, origins="*")
  ```

---

### Issue 2: Backend Sleeping

**What you'll see:**
- First request takes 30+ seconds
- Subsequent requests are fast
- Error after 30 seconds of inactivity

**Fix:**
- This is normal for Render free tier!
- Backend "sleeps" after 15 minutes of inactivity
- First request wakes it up (slow)
- All following requests are fast

---

### Issue 3: Build Failed

**What you'll see on Render:**
```
==> Build failed
ERROR: Could not find a version that satisfies the requirement...
```

**Fix:**
- Check `requirements.txt` has all dependencies
- Ensure Python version is compatible
- Check Render logs for specific error

**What you'll see on Vercel:**
```
Build failed
npm ERR! code ELIFECYCLE
```

**Fix:**
- Check `package.json` is in `frontend/` directory
- Ensure Root Directory is set to `frontend`
- Check Vercel logs for specific error

---

### Issue 4: Environment Variable Not Set

**What you'll see:**
- Frontend loads but can't reach backend
- Console shows: "Network Error" or 404

**Fix on Vercel:**
1. Go to Project → Settings → Environment Variables
2. Check `REACT_APP_API_URL` exists
3. Should be: `https://your-backend.onrender.com/api`
4. If missing or wrong, add/update it
5. Trigger new deployment (Settings → Deployments → Redeploy)

---

## 📱 What Users Will See

When someone visits your app at `https://voting-blockchain.vercel.app`:

1. **Homepage**: 
   - Beautiful gradient hero
   - "Get Started" and "View Elections" buttons
   - Feature cards explaining the system

2. **Register Page**:
   - Form to enter name and email
   - Get voter ID and secret key
   - Warning to save credentials

3. **Login Page**:
   - Enter voter ID and secret key
   - Login to access voting

4. **Elections Page**:
   - Grid of election cards
   - Status badges (active/closed)
   - Participant counts

5. **Vote Page**:
   - Election details
   - Radio buttons for candidates
   - Submit vote button
   - Real-time results

6. **Blockchain Explorer**:
   - All blocks displayed
   - Transaction history
   - Mining functionality

---

## 🎉 You're Done!

**Share these URLs:**

- **App**: https://voting-blockchain.vercel.app
- **API**: https://voting-blockchain-api.onrender.com

**Show your project:**
- Demo it in class
- Add to your portfolio
- Share on LinkedIn
- Put on your resume!

---

## 🆘 Need Help?

1. **Check Logs**:
   - Render: Dashboard → Service → Logs
   - Vercel: Project → Deployments → Click deployment → Logs

2. **Test Components**:
   - Backend health: `https://your-app.onrender.com/api/health`
   - Frontend: Open browser console (F12)

3. **Read Docs**:
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Full guide
   - [DEPLOY_QUICKSTART.md](DEPLOY_QUICKSTART.md) - Quick guide

4. **Common Fixes**:
   - Redeploy: Trigger new deployment
   - Clear cache: Hard refresh (Ctrl+Shift+R)
   - Check URLs: Ensure API URL is correct
   - Wait: Backend may be waking up (30 seconds)

---

**Good luck! Your blockchain voting system will be live in minutes! 🚀**
