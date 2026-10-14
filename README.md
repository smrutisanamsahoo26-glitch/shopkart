# ShopKart — Full Stack MERN E-Commerce Application

A modern, full-stack e-commerce web platform built with Node.js, Express, MongoDB, React, and Vite.

---

## Project Structure

```text
ShopKart/
├── backend/                     # Node.js + Express API
│   ├── config/                  # Razorpay & DB configuration
│   ├── controllers/             # Business logic controllers
│   ├── middlewares/             # Auth & error middlewares
│   ├── models/                  # Mongoose schemas & models
│   ├── routes/                  # Express API routes
│   ├── utils/                   # Token generators & helpers
│   ├── .env.example             # Backend environment template
│   ├── .gitignore               # Backend gitignore
│   ├── index.js                 # Server entry point
│   └── package.json
├── shopkart-frontend/           # React + Vite Client
│   ├── public/                  # Static assets & _redirects (SPA routing)
│   ├── src/                     # React components, pages, services
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/api.js      # Axios instance configured with VITE_API_URL
│   ├── .env.example             # Frontend environment template
│   ├── .gitignore               # Frontend gitignore
│   ├── package.json
│   └── vite.config.js
├── .gitignore                   # Root gitignore
├── render.yaml                  # Render Blueprint definition
└── README.md
```

---

## 1. Pushing to GitHub

Run these commands inside the `ShopKart` folder:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files (node_modules and .env files are automatically excluded by .gitignore)
git add .

# 3. Commit the changes
git commit -m "feat: configure ShopKart for Render and Vite production deployment"

# 4. Set main branch
git branch -M main

# 5. Connect your remote repository (replace with your GitHub repository URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push to GitHub
git push -u origin main
```

---

## 2. Deploying on Render

You can deploy Backend and Frontend as two separate services on [Render](https://render.com) using the same GitHub repository.

### A. Deploy Backend (Web Service)

1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `shopkart-backend`
   - **Region**: Choose the closest region (e.g. Frankfurt / Singapore / Oregon)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. In the **Environment Variables** section, add:
   - `NODE_ENV` = `production`
   - `PORT` = `8085` (Render also provides this dynamically)
   - `MONGO_URI` = `<your MongoDB Atlas connection string>`
   - `JWT_SECRET` = `<a strong random secret string>`
   - `JWT_EXPIRES_IN` = `1d`
   - `RAZORPAY_KEY_ID` = `<your Razorpay Key ID>`
   - `RAZORPAY_KEY_SECRET` = `<your Razorpay Key Secret>`
   - `CLIENT_URL` = `<your frontend URL on Render, e.g. https://shopkart-frontend.onrender.com>` *(You can update this after deploying frontend)*
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://shopkart-backend.onrender.com`).

---

### B. Deploy Frontend (Static Site)

1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect the same GitHub repository.
3. Configure the static site settings:
   - **Name**: `shopkart-frontend`
   - **Root Directory**: `shopkart-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. In the **Environment Variables** section, add:
   - `VITE_API_URL` = `https://shopkart-backend.onrender.com` *(replace with your actual backend URL from Step A)*
5. In **Redirects / Rewrites** (or under `shopkart-frontend/public/_redirects`), ensure client-side SPA routing rewrite is active:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

### C. Final Step: Link Frontend URL to Backend CORS

1. Copy your live frontend URL (e.g. `https://shopkart-frontend.onrender.com`).
2. Go to your **Backend Web Service** settings on Render -> **Environment Variables**.
3. Set `CLIENT_URL` to your live frontend URL.
4. Save changes (Render will automatically redeploy the backend with the new allowed origin).

---

## 3. Local Development

### Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev
```

### Frontend
```bash
cd shopkart-frontend
cp .env.example .env   # defaults to http://localhost:8085
npm install
npm run dev
```
