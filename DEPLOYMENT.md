# Deployment Guide

This guide explains how to deploy this application to **Vercel** (frontend) and **Render** (backend + database).

## Prerequisites

- GitHub account (repository must be pushed to GitHub)
- Vercel account (free tier available)
- Render account (free tier available)

## Step 1: Deploy PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `tp-database`
   - **Database**: `mydb`
   - **User**: `admin`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid if needed)
4. Click **Create Database**
5. Wait for the database to be created (takes 1-2 minutes)
6. Once created, click on the database name
7. Go to **Connect** tab and copy the connection details:
   - **Host**
   - **Port** (usually 5432)
   - **User**
   - **Password**
   - **Database** (mydb)

### Initialize Database

1. In the Render database dashboard, go to **Shell** or **PSQL** tab
2. Run the SQL script from `database/init.sql`:

```sql
CREATE TABLE users (
 id SERIAL PRIMARY KEY ,
 name VARCHAR (100) NOT NULL ,
 email VARCHAR (100) UNIQUE NOT NULL
) ;

INSERT INTO users ( name , email ) VALUES
 ('Alice', 'alice@example.com') ,
 ('Bob', 'bob@example.com') ;
```

## Step 2: Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the repository: `tp-docker-cicd`
5. Configure the service:
   - **Name**: `tp-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if needed)
6. Add Environment Variables:
   - `PORT` = `10000` (Render default port)
   - `DB_HOST` = (from database connection string)
   - `DB_PORT` = `5432` (or from database connection)
   - `DB_USER` = `admin` (or from database connection)
   - `DB_PASSWORD` = (from database connection string)
   - `DB_NAME` = `mydb`
   - `FRONTEND_URL` = (will update after frontend deployment)
7. Click **Create Web Service**
8. Wait for deployment to complete
9. Copy the service URL (e.g., `https://tp-backend.onrender.com`)

## Step 3: Deploy Frontend on Vercel

### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: (press Enter for default)
   - Directory: `./frontend`
   - Override settings? **No**

5. Copy the deployment URL (e.g., `https://your-app.vercel.app`)

### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Click **Deploy**
6. Wait for deployment
7. Copy the deployment URL

## Step 4: Update Configuration with Actual URLs

### Update Frontend

1. Edit `frontend/index.html`
2. Replace `YOUR_RENDER_BACKEND_URL` with your actual Render backend URL (without `https://` and `.onrender.com`)
   - Example: If your backend is `https://tp-backend.onrender.com`, replace with `tp-backend`

### Update Backend CORS

1. Edit `backend/server.js`
2. Replace `YOUR_VERCEL_APP` with your actual Vercel app name
   - Example: If your frontend is `https://my-app.vercel.app`, replace with `my-app`

### Update Render Environment Variables

1. Go to Render Dashboard → Your Backend Service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` with your Vercel URL (e.g., `https://my-app.vercel.app`)
4. Click **Save Changes**
5. Render will automatically redeploy

### Redeploy Services

1. **Frontend**: Push changes to GitHub, Vercel will auto-deploy
2. **Backend**: Render will auto-redeploy after environment variable change

## Step 5: Verify Deployment

1. Visit your Vercel frontend URL
2. Check that:
   - API response shows data from backend
   - Database response shows users from PostgreSQL
3. If errors occur, check:
   - Browser console for CORS errors
   - Render logs for backend errors
   - Database connection in Render dashboard

## Troubleshooting

### CORS Errors

- Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check that the URL in `backend/server.js` CORS configuration is correct
- Verify the frontend is using the correct backend URL

### Database Connection Errors

- Verify all database environment variables in Render are correct
- Check that the database is running in Render dashboard
- Ensure the database initialization script ran successfully

### Frontend Not Loading Backend Data

- Check browser console for errors
- Verify the backend URL in `frontend/index.html` is correct
- Ensure backend service is running (check Render dashboard)

## Environment Variables Summary

### Render Backend Service
- `PORT`: `10000`
- `DB_HOST`: (from database)
- `DB_PORT`: `5432`
- `DB_USER`: `admin`
- `DB_PASSWORD`: (from database)
- `DB_NAME`: `mydb`
- `FRONTEND_URL`: `https://your-vercel-app.vercel.app`

## Notes

- Render free tier services spin down after 15 minutes of inactivity (first request may be slow)
- Vercel free tier is generous for static sites
- Database on Render free tier has limitations (90 days retention, connection limits)
- All services will auto-deploy on git push if connected to GitHub

