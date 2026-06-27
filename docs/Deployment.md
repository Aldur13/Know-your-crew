# Deployment Guide

The game is a single Node.js process in production — Express serves the built React client and handles WebSocket connections on the same port. Any platform that supports Node.js and WebSockets works.

---

## Option A — Railway (Recommended, free tier)

A `railway.toml` is already included in the repo — Railway will pick it up automatically.

### Steps

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo** and select this repository
3. In the Railway dashboard, go to your service → **Variables** and add:
   ```
   NODE_ENV=production
   ```
4. Railway builds and deploys automatically. It gives you a public `*.up.railway.app` URL — share it with your players!

Every push to the branch redeploys automatically.

> **What `railway.toml` does:** It tells Railway to run `npm install --prefix client && npm run build --prefix client` as the build step (Vite compiles the React app), then start the server with `npm start`. Root dependencies (Express, Socket.io) are installed by Railway automatically before the build command runs.

---

## Option B — Render (free tier)

1. Go to [render.com](https://render.com) and connect your GitHub account
2. Click **New → Web Service** and select this repo
3. Set:
   - **Build Command:** `npm install && npm install --prefix client && npm run build --prefix client`
   - **Start Command:** `npm start`
   - **Environment Variable:** `NODE_ENV=production`
4. Deploy — Render gives you a `*.onrender.com` URL

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first player to open the link may wait ~30 seconds for the server to wake up.

---

## Option C — Fly.io

1. Install the [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
2. From the project root:
   ```bash
   fly launch       # follow the prompts
   npm run build
   fly deploy
   ```
3. Set the secret: `fly secrets set NODE_ENV=production`

---

## WebSocket note

All three platforms above support WebSockets on their free tiers. Socket.io is used for all real-time communication — make sure your platform does **not** force HTTP/2 only (it breaks WebSocket upgrades on some edge proxies).

---

## Playing on a local network (no internet needed)

If everyone is on the same Wi-Fi, you can run the game on your laptop without deploying anywhere:

```bash
npm run build
NODE_ENV=production node server/index.js
```

Find your local IP address:
```bash
# Mac / Linux
ifconfig | grep 'inet '

# Windows
ipconfig
```

Share `http://YOUR_LOCAL_IP:3001` with everyone on the same network. No internet required!
