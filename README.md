# Know Your Crew

A social multiplayer party game for game night. Players answer fun icebreaker questions about themselves, then try to guess which answers and which players said what.

Supports 3–18 players. Works on any device with a browser — phones, tablets, laptops. No app install needed.

---

## How to Play

### Setup
1. One person creates a room and becomes the host.
2. The host chooses game settings — default or custom questions, and how many rounds (5–40).
3. The host shares the 4-letter room code with everyone.
4. All players join and fill in their profile (answer all the questions honestly!).
5. Once everyone is ready, the host starts the game.

### During the Game
There are two types of rounds that alternate throughout the game:

**Answer-guess rounds** — A player is put in the spotlight. Everyone else sees their name and a question, and must pick which of the 4 answers is theirs. The subject watches and sees how many people have guessed.

**Player-guess rounds** — An answer is revealed on screen. Everyone must guess which player said it, choosing from the player names shown.

### Scoring
- **Correct guess:** 500–1000 points. The faster you answer, the more points you earn.
- **Wrong guess:** 0 points.
- **Subject bonus:** The person in the spotlight earns +25 points for every player who guesses wrong — so having a surprising or unique answer pays off!

A leaderboard is shown after every round, and a final podium is revealed at the end.

---

## Game Settings (Host Only)

The host sees a settings screen before filling in their profile:

| Setting | Options | Default |
|---|---|---|
| Questions | Default (10 built-in) or Custom (enter your own) | Default |
| Number of rounds | 5–40 | 20 |

**Custom questions** require at least 5 players, since there need to be enough answer options to make guessing hard. Default questions work with as few as 3 players — pre-seeded fallback answers fill in any missing options automatically.

---

## Local Development

**Prerequisites:** Node.js 18+

```bash
# Install all dependencies (run once)
npm run install:all

# Start both server and client in dev mode
npm run dev
```

- Server runs on `http://localhost:3001`
- Client (Vite) runs on `http://localhost:5173`

Open `http://localhost:5173` in your browser to play. You can open multiple tabs to simulate multiple players.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in as needed:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port the Express/Socket.IO server listens on |
| `NODE_ENV` | `development` | Set to `production` for deployment |
| `CLIENT_URL` | *(unset)* | **Required in production.** The public URL of your deployed frontend (e.g. `https://your-app.up.railway.app`). Used to restrict CORS so only your client can connect. |

In development, CORS is open (`*`). In production, `CLIENT_URL` must be set or Socket.IO connections will be blocked.

---

## Production Build

```bash
npm run build   # Builds the React client into client/dist/
npm start       # Starts the Express server (serves built client in production)
```

The server serves the built client files automatically when `NODE_ENV=production`.

---

## Deploying to Railway

The repo includes a `railway.toml` that handles the build and start commands automatically.

### Steps
1. Push your code to GitHub.
2. Go to [railway.app](https://railway.app) and create a new project.
3. Choose **Deploy from GitHub repo** and select this repository.
4. Set the deployment branch to `main`.
5. In the Railway dashboard, add these environment variables:
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = your Railway public URL (found under **Settings → Domains**)
6. Railway will build and deploy automatically. Any future push to `main` triggers a redeploy.

### Notes
- Railway assigns a public URL like `https://your-app.up.railway.app`. Set that as `CLIENT_URL`.
- The free Railway tier is sufficient for small game nights (under ~10 concurrent players).
- Rooms are automatically cleaned up: lobby rooms after 1 hour of inactivity, finished games after 15 minutes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js, Express, Socket.IO |
| Client | React, Vite |
| Real-time | WebSockets via Socket.IO |
| Hosting | Railway |
