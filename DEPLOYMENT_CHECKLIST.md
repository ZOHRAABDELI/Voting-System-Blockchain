# ✅ Deployment Checklist

Use this checklist to deploy your blockchain voting system step by step.

---

## 📋 Pre-Deployment

- [ ] All code is working locally
- [ ] Backend tests passing: `python test.py`
- [ ] Persistence tests passing: `python test_persistence.py`
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] All changes committed to git
- [ ] Code pushed to GitHub: `git push origin main`

---

## 🔧 Backend Deployment (Render.com)

### Account Setup
- [ ] Created account at https://render.com
- [ ] Signed in with GitHub
- [ ] GitHub repository connected

### Service Configuration
- [ ] Clicked "New +" → "Web Service"
- [ ] Selected "Voting-System-Blockchain" repository
- [ ] Configured settings:
  - [ ] Name: `voting-blockchain-api`
  - [ ] Environment: `Python 3`
  - [ ] Build Command: `pip install -r requirements.txt`
  - [ ] Start Command: `gunicorn -c gunicorn_config.py app:app`
  - [ ] Instance Type: `Free`

### Persistent Storage
- [ ] Clicked "Advanced"
- [ ] Added Disk:
  - [ ] Name: `blockchain-data`
  - [ ] Mount Path: `/opt/render/project/src/data`
  - [ ] Size: `1 GB`

### Deployment
- [ ] Clicked "Create Web Service"
- [ ] Waited for deployment to complete (5-10 minutes)
- [ ] Build successful (green checkmark)
- [ ] Service status: "Live" (green dot)

### Testing Backend
- [ ] Copied backend URL: `https://_________________________.onrender.com`
- [ ] Tested health endpoint: `https://your-url.onrender.com/api/health`
- [ ] Received JSON response: `{"status":"healthy",...}`
- [ ] No errors in Render logs

---

## 🎨 Frontend Deployment (Vercel)

### Update Configuration
- [ ] Opened `frontend/.env.production`
- [ ] Updated API URL with backend URL from above
- [ ] Saved file
- [ ] Committed change: `git add frontend/.env.production`
- [ ] Pushed to GitHub: `git commit -m "Update API URL" && git push`

### Account Setup
- [ ] Created account at https://vercel.com
- [ ] Signed in with GitHub

### Project Import
- [ ] Clicked "Add New..." → "Project"
- [ ] Selected "Voting-System-Blockchain" repository
- [ ] Clicked "Import"

### Build Configuration
- [ ] Framework Preset: `Create React App` (auto-detected)
- [ ] **Root Directory**: Changed to `frontend`
- [ ] Build Command: `npm run build` (auto-filled)
- [ ] Output Directory: `build` (auto-filled)
- [ ] Install Command: `npm install` (auto-filled)

### Environment Variables
- [ ] Added environment variable:
  - [ ] Name: `REACT_APP_API_URL`
  - [ ] Value: `https://your-backend.onrender.com/api` (from backend)

### Deployment
- [ ] Clicked "Deploy"
- [ ] Waited for deployment (2-5 minutes)
- [ ] Build successful
- [ ] Status: "Ready"

### Testing Frontend
- [ ] Copied frontend URL: `https://_________________________.vercel.app`
- [ ] Opened URL in browser
- [ ] Homepage loads without errors
- [ ] No console errors (F12 → Console)

---

## 🧪 Integration Testing

### Basic Functionality
- [ ] **Homepage**: Loads correctly with hero section
- [ ] **Registration**: 
  - [ ] Can register a new voter
  - [ ] Receives voter ID and secret key
  - [ ] Saves credentials
- [ ] **Login**:
  - [ ] Can login with credentials
  - [ ] Redirected to elections page
- [ ] **Create Election**:
  - [ ] Can create new election
  - [ ] Election appears in list
- [ ] **Voting**:
  - [ ] Can view election details
  - [ ] Can select a candidate
  - [ ] Can submit vote
  - [ ] Success message appears
- [ ] **Results**:
  - [ ] Results display correctly
  - [ ] Vote counts accurate
  - [ ] Percentages calculated
- [ ] **Blockchain**:
  - [ ] Blockchain explorer loads
  - [ ] Blocks display
  - [ ] Transactions visible

### Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browser

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 🔐 Security Checks

- [ ] HTTPS enabled on both frontend and backend
- [ ] No sensitive data in frontend code
- [ ] API endpoints require authentication where needed
- [ ] CORS properly configured
- [ ] No exposed credentials in public repos

---

## 📝 Documentation

- [ ] Saved backend URL for reference
- [ ] Saved frontend URL for reference
- [ ] Updated README with deployment info (optional)
- [ ] Created documentation for users (optional)

---

## 🎉 Post-Deployment

### Monitoring
- [ ] Bookmarked Render dashboard
- [ ] Bookmarked Vercel dashboard
- [ ] Set up error notifications (optional)
- [ ] Set up uptime monitoring with UptimeRobot (optional)

### Sharing
- [ ] Shared frontend URL with instructor/team
- [ ] Added to portfolio website
- [ ] Updated LinkedIn/resume
- [ ] Shared demo video (optional)

### Maintenance
- [ ] Know how to check logs:
  - [ ] Render: Dashboard → Service → Logs
  - [ ] Vercel: Project → Deployments → Logs
- [ ] Know how to redeploy:
  - [ ] Push to GitHub triggers auto-deploy
- [ ] Know how to update environment variables:
  - [ ] Render: Dashboard → Service → Environment
  - [ ] Vercel: Project → Settings → Environment Variables

---

## 🆘 Troubleshooting Completed

If you encountered issues, check what you fixed:

- [ ] CORS errors → Updated CORS settings in `app.py`
- [ ] Backend sleeping → Expected behavior, first request is slow
- [ ] 404 errors → Fixed API URL in environment variables
- [ ] Build errors → Fixed configuration or dependencies
- [ ] Data not persisting → Verified disk mount path on Render

---

## 📊 Final Status

**Deployment Date**: ________________

**URLs**:
- Frontend: https://________________________________________________
- Backend: https://________________________________________________

**Status**: 
- [ ] ✅ Successfully deployed and tested
- [ ] ⚠️ Deployed with minor issues
- [ ] ❌ Deployment failed (see notes below)

**Notes**:
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## 🎯 Success Criteria

Your deployment is successful if you can:
- ✅ Access frontend URL from any device
- ✅ Register a new voter
- ✅ Login with credentials
- ✅ Create an election
- ✅ Cast a vote
- ✅ View results
- ✅ Explore blockchain
- ✅ Data persists after backend restart

---

## 🚀 Next Steps

After successful deployment:
1. [ ] Share with users/classmates
2. [ ] Collect feedback
3. [ ] Monitor usage and performance
4. [ ] Plan improvements
5. [ ] Consider upgrading to paid tier if needed

---

**Congratulations! Your blockchain voting system is now live! 🎉**

Frontend: https://your-app.vercel.app  
Backend: https://your-app.onrender.com

Happy voting! 🗳️✨
