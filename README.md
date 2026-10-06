# TutorMind

TutorMind is a gamified AI math and STEM learning platform built with React, MUI, Framer Motion, Recharts, Axios, React Router, Express, JWT, bcrypt, and MongoDB-ready configuration.

## Run locally

Requirements: Node.js 18+ and npm. MongoDB is optional for the included demo mode.

```powershell
npm run install:all
npm run dev
```

Open `http://127.0.0.1:5173`.

The API runs at `http://localhost:5000`. The frontend uses a demo login and the backend uses an in-memory seed store by default, so the complete flow works without Python or MongoDB.

## Enable real AI tutoring

The Tutor calls an OpenAI-compatible chat-completions endpoint from the backend. Copy `backend/.env.example` to `backend/.env` and set:

```text
AI_API_KEY=your_gemini_key
AI_PROVIDER=gemini
AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent
AI_MODEL=gemini-3.5-flash-lite
```

Restart `npm run dev` after changing environment variables. The key stays on the backend and is never sent to the browser. Without a key, the app uses the limited local fallback and clearly reports provider errors.

## Demo account

- Email: `student1@tutormind.com`
- Password: `Student@123`

## MongoDB configuration

Copy `backend/.env.example` to `backend/.env`, set `MONGODB_URI`, and connect the persistence layer in `backend/src/server.js` when deploying. The current API keeps the same contracts while running in demo-memory mode for reliable local startup.

## Available API groups

- `/api/auth`: register, login, profile, update, logout
- `/api/lessons`: filtering, recommendations, lesson detail, completion
- `/api/progress`: overview, lessons, topics, stats
- `/api/gamification`: badges, earned badges, leaderboard, XP
- `/api/ai`: chat, conversations, explanations, hints
- `/api/ai/vision`: analyze handwritten canvas drawings, images, and PDFs with Gemini Vision
- `/api/health`: service health check

## Production build

```powershell
npm run build
npm start --prefix backend
```

The frontend build is emitted to `frontend/dist`. For production, set a strong `JWT_SECRET`, restrict `CORS_ORIGIN`, connect MongoDB Atlas, and provide an LLM provider through `AI_API_KEY` and `AI_API_URL`.
