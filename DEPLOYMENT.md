# Vercel Deployment Guide for Shop ERP

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your GitHub account

### Step 2: Deploy the Project
1. Click "Add New..." → "Project"
2. Select the `shop` repository (02reddy/shop)
3. Configure Build Settings:
   - **Framework**: Next.js (or React if not auto-detected)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
4. Add Environment Variables:
   - Variable: `REACT_APP_API_URL`
   - Value: `http://localhost:5000` (for local backend) or your deployed backend URL
5. Click "Deploy"

### Step 3: Configure Backend URL
Once your frontend is deployed on Vercel, you'll have a URL like:
`https://your-project-name.vercel.app`

If your backend is also deployed (Heroku, Railway, etc.), update the `REACT_APP_API_URL` in Vercel settings.

## Backend Setup (Keep Running Locally)

Your backend should continue running on `http://localhost:5000`.

To start the backend:
```bash
cd c:\Users\shashidharreddy\Desktop\newfu\backend
npm install
npm start
```

The backend needs:
- Node.js and npm
- MongoDB (running, default: mongodb://localhost:27017/shop-erp)
- Environment variables in `.env` file (JWT_SECRET, email config, etc.)

## Testing After Deployment

1. Go to your Vercel deployment URL
2. Try logging in with demo credentials:
   - Username: admin
   - Password: admin123
3. If you see "Invalid token" errors, check:
   - Backend is running and accessible
   - `REACT_APP_API_URL` environment variable is correctly set
   - CORS is enabled in the backend (it should be by default)

## Troubleshooting

### "Cannot reach backend" error
- Ensure backend is running: `npm start` in `/backend`
- Check `REACT_APP_API_URL` is correctly set to your backend URL

### "Invalid token" error
- Backend JWT verification is failing
- Ensure `JWT_SECRET` in backend `.env` matches the secret used during login
- Check browser console for actual error details

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Ensure `frontend/build` directory is correctly generated locally
- Verify all imports are correct

