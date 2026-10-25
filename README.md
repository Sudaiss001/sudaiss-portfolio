# Sudaiss Portfolio — Real-time Voice Assistant

This package adds a floating "Talk to Sudaiss AI" button to the existing React + TypeScript portfolio and a Node/Express backend route for OpenAI's Realtime API over WebRTC.

## Files

- `src/App.tsx` — your existing portfolio with the voice assistant mounted near the end of `<main>`.
- `src/VoiceAssistant.tsx` — call UI, microphone permission, connecting/connected states, transcript display, cancel/end controls.
- `server.mjs` — backend proxy; the standard API key stays server-side.
- `.env.example` — environment-variable template.
- `vite.config.example.ts` — development proxy example.

## 1. Copy into your existing project

Back up your existing `src/App.tsx` first, then copy:
- `src/App.tsx` to your project's `src/App.tsx`
- `src/VoiceAssistant.tsx` to your project's `src/VoiceAssistant.tsx`

This App.tsx is based on the supplied version and keeps its existing portfolio content/design. If you've made new edits since supplying that file, merge the import and `<VoiceAssistant />` insertion instead of overwriting your newer work.

## 2. Install backend packages

From your portfolio project folder:

```bash
npm install express dotenv
```

Your project should already have Vite, React, TypeScript and the Tailwind setup.

## 3. Add backend environment variables

Copy `.env.example` to `.env` in the project root and set `OPENAI_API_KEY` to your own API key. Do not put this key in any `VITE_` variable, frontend source file, GitHub commit, or browser code. Add `.env` to `.gitignore`.

## 4. Add a development proxy

Merge the settings in `vite.config.example.ts` into your existing `vite.config.ts` so requests from `/api` go to `http://localhost:3001`.

## 5. Add scripts

Merge these scripts into `package.json` (keep your existing scripts and dependencies):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "voice:server": "node server.mjs"
  }
}
```

If your current build script is different, keep the one that already builds your project correctly and add only `voice:server`.

## 6. Run locally

Use two terminals:

Terminal 1:
```bash
npm run voice:server
```

Terminal 2:
```bash
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`). Click **Talk to Sudaiss AI**, then **Start Call**, and grant microphone permission. The browser needs HTTPS in production; localhost is allowed for local testing.

## 7. Before deployment

- The Node backend must be deployed with the built `dist` directory or hosted alongside your frontend.
- Set the API key as a secret environment variable in your backend host, never in the frontend.
- Protect the public session endpoint with rate limits and abuse controls before broad public launch; the sample endpoint is a starter, not a complete production security layer.
- Set usage limits/alerts for the API account.
- Test browser microphone permissions, audio output, call cancellation, mobile layout, failed network, and connection errors.
- A response within five seconds is a target, not a guarantee; connection speed and provider/network conditions affect it.
- The transcript UI depends on the Realtime session emitting transcription events; if a selected model/config does not emit them, audio conversation can still work while transcript text remains empty.
- This implementation only connects the voice session. It does not yet store enquiries or give the assistant private access to a database. Add those through a secured backend in a later phase.

## Architecture

Browser microphone/audio ⇄ WebRTC ⇄ OpenAI Realtime API  
Browser SDP offer → `/api/realtime-call` on your Express backend → OpenAI API  
Your standard OpenAI API key remains on the backend.

Official guide: https://developers.openai.com/api/docs/guides/voice-webrtc
