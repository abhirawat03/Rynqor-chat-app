
# Rynqor — Real-time Chat App

Overview
--------
Rynqor is a MERN-style real-time chat application that demonstrates common chat features: authentication, one-to-one and group conversations, message history, media uploads, presence (online/offline), typing indicators, and read receipts. The UI is a React app built with Vite; the server is an Express API with Socket.IO for realtime features.

Why this repo
----------------
- Good reference for building chat apps with Socket.IO and MongoDB.
- Demonstrates combining REST APIs (for standard CRUD) with realtime sockets (for low-latency updates).
- Lightweight and easy to run locally.

Key features (explained)
-------------------------
- Authentication: Users can sign up and log in. The server issues access and refresh tokens (JWT). Access tokens are short-lived; refresh tokens renew them.

- Conversations: Conversations store participants and metadata. The client lists conversations and shows the last message and unread counts.

- Messaging: Messages are persisted in MongoDB and delivered in realtime via Socket.IO. The system supports optimistic local messages (client shows a pending message while the server confirms).

- Presence: The server tracks online users and broadcasts `online_users`, `user_online` and `user_offline` events so the UI can show who is online and when someone was last seen.

- Typing indicators: While a user types, the client emits `typing`/`stop_typing` and other participants see live typing indicators.

- Read receipts: When messages are read, clients emit `mark_read`; the server updates message statuses and broadcasts `messages_read` so senders see their messages marked as read.

- Media uploads: Images and media can be uploaded and stored via Cloudinary from the server. Cloudinary credentials are optional locally but required for media features.

Architecture & important files
-----------------------------
- Frontend (client): React app using Vite. Entry: [client/src/main.jsx](client/src/main.jsx). The frontend manages sockets in [client/src/services/socket/SocketProvider.jsx](client/src/services/socket/SocketProvider.jsx) and connects to `http://localhost:8000` by default in [client/src/services/socket/socket.js](client/src/services/socket/socket.js).

- Backend (server): Express app. Server bootstrap: [server/src/index.js](server/src/index.js). Express routes and middleware are wired in [server/src/app.js](server/src/app.js). Socket.IO setup is in [server/src/socket/index.js](server/src/socket/index.js) and realtime logic lives in [server/src/socket/handlers.js](server/src/socket/handlers.js).

- Database: MongoDB via Mongoose. Connection code: [server/src/config/db.js](server/src/config/db.js).

Tech stack (detailed)
---------------------
- Frontend
	- React 19 — UI library
	- Vite — fast dev server and bundler
	- TailwindCSS — utility-first CSS (configured in the client)
	- react-query (@tanstack/react-query) — server-state and caching for REST requests
	- socket.io-client — realtime socket connection

- Backend
	- Node (ESM) and Express 5 — HTTP API
	- socket.io — realtime events and rooms
	- Mongoose — MongoDB ODM
	- JWT (jsonwebtoken) — access & refresh tokens
	- multer + cloudinary — file uploads

- Dev / tools
	- eslint, vite, react-hot-toast, axios

Quick start (development)
-------------------------
Prerequisites
- Node.js (18+) and npm
- MongoDB (local or remote)

1) Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

2) Configure environment (server/.env)

Create `server/.env` with at least these values (example):

```env
PORT=8000
MONGODB_URL=mongodb://localhost:27017
DB_NAME=rynqor

# Optional: Cloudinary for media uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT
ACCESS_TOKEN_SECRET=some_long_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=another_long_secret
REFRESH_TOKEN_EXPIRY=7d
```

Notes
- The client socket URL is set in [client/src/services/socket/socket.js](client/src/services/socket/socket.js). By default it points to `http://localhost:8000`. If you run the server on a different `PORT`, update that URL or set `PORT=8000` in your `.env`.

3) Run

```bash
# start server
cd server
npm run dev

# start client
cd ../client
npm run dev
```

API overview
-------------
- Base: `http://localhost:<PORT>/api/v1`
- Auth: `/api/v1/auth` — signup, login, refresh, logout
- Users: `/api/v1/users` — profile, search, sessions
- Conversations: `/api/v1/conversations` — list, create, update participants
- Messages: `/api/v1/messages` — fetch messages, pagination

Realtime socket events (more detail)
-----------------------------------
- Connection
	- The server authenticates socket connections with `socketAuth` middleware before registering handlers.

- Presence
	- `online_users` (server → client): initial list of online user IDs
	- `user_online` / `user_offline` (server → client): broadcast when a user comes online/goes offline

- Conversation control
	- `join_conversation` (client → server): request to join a conversation room (server validates membership)

- Sending messages
	- `send_message` (client → server): payload includes `conversationId`, `text`, optional `media`, and a `clientTempId` for optimistic UI
	- `message_sent` (server → sender): ack with saved message (used to clear optimistic state)
	- `new_message` (server → room): new message delivered to other participants
	- `message_failed` (server → sender): indicates server-side failure to persist/send

- Read receipts
	- `mark_read` (client → server): includes `conversationId` and optional `lastReadAt`
	- `messages_read` (server → room): informs participants which messages were marked read

- Typing
	- `typing` / `stop_typing` (client → server) and broadcast to room so others can show typing indicators

Development notes & troubleshooting
----------------------------------
- CORS: server currently allows origin `http://localhost:5173`. Change `server/src/app.js` if your client runs on another origin.
- Socket URL mismatch: keep `PORT` and client socket URL in sync (see [client/src/services/socket/socket.js](client/src/services/socket/socket.js)).
- Media uploads: if Cloudinary is not configured, media upload UI may still appear but will fail — add Cloudinary env vars or mock uploads in dev.

Extending the app
------------------
- Add typing indicators per-conversation with timestamps for better UX.
- Add delivery receipts separate from read receipts.
- Add message search and pagination improvements.

Contributing
------------
- Fork, make focused changes, open a PR. Describe breaking changes and migration steps.

License
-------
- No license file present. Add a `LICENSE` if you want to define reuse terms.

Acknowledgements
-----------------
- Built as a reference MERN realtime chat application combining REST + Socket.IO patterns.

