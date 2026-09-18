# Deployment Guide

This project is structured as a full-stack MERN app:
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + MongoDB
- Database: MongoDB Atlas

## 1) Prepare Git

From the project root:

```bash
git init
git add .
git commit -m "Initial commit"
```

Then push to GitHub:

```bash
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

> Make sure the repository includes the `.gitignore` file before committing.

---

## 2) Backend deployment on Render

### Create the Render service
1. Go to Render.
2. Click New > Web Service.
3. Connect your GitHub repository.
4. Select the repo.
5. Set the service details:
   - Name: your-app-backend
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

### Backend environment variables
Add these in Render:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ccms?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-frontend.vercel.app

# Optional Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Backend health check
After deployment, test this URL:

```text
https://your-render-service.onrender.com/api/v1/health
```

Expected result: JSON with `success: true` and status `UP`.

---

## 3) Frontend deployment on Vercel

### Create the Vercel project
1. Go to Vercel.
2. Import your GitHub repo.
3. Set the project root to `client`.
4. Framework: Vite
5. Build Command: `npm run build`
6. Output Directory: `dist`

### Frontend environment variables
Add this in Vercel:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api/v1
```

### Vercel rewrites
If client-side routes fail on refresh, add a Vercel config file in `client` called `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 4) MongoDB Atlas setup

1. Create an Atlas account.
2. Create a cluster.
3. Create a database user.
4. Allow network access from `0.0.0.0/0` for testing/demo.
5. Copy the connection string.
6. Add it to Render as `MONGODB_URI`.

Example:

```env
MONGODB_URI=mongodb+srv://<db_user>:<password>@<cluster>.mongodb.net/ccms?retryWrites=true&w=majority
```

---

## 5) Production checklist

Before finalizing the live app, verify:

- Frontend opens on Vercel
- Backend health endpoint is alive on Render
- MongoDB connects successfully
- Login and registration work
- Complaint submission works
- Dashboard and admin views load correctly
- CORS is configured for the Vercel domain
- No secrets are committed to Git

---

## 6) Common deployment errors

### Port conflict locally
If the backend says port 5000 is in use:

```bash
Stop-Process -Id <process-id> -Force
```

Or change `PORT` in the `.env` file.

### CORS error in browser
Update `CLIENT_URL` in the backend environment variables to match your Vercel domain exactly.

### Frontend cannot access backend
Check that `VITE_API_BASE_URL` matches your Render backend URL exactly.

---

## 7) Final deployment flow

1. Push repo to GitHub
2. Deploy MongoDB Atlas
3. Deploy backend to Render
4. Deploy frontend to Vercel
5. Update environment variables
6. Test the live app end to end

---

## 8) Useful commands

Run locally:

```bash
npm run dev
```

Build frontend for production:

```bash
npm --prefix client run build
```

Start backend locally:

```bash
cd server
node src/server.js
```

---

If everything works locally and the env values are set correctly on Render and Vercel, the app is ready for deployment.
