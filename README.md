
# Rynqor — Real-time Chat App

Overview
--------
Rynqor is a MERN-style real-time chat application. The repository contains a React frontend and an Express backend with Socket.IO for realtime messaging. The app includes authentication, conversations, message persistence, realtime delivery, presence, typing indicators, read receipts, and media uploads via Cloudinary.

Key features (implemented)
---------------------------
- Authentication: signup and login endpoints using JWT access and refresh tokens.
- Conversations: persistent conversation records with participants and last-message metadata.
- Messaging: persisted messages in MongoDB; messages relayed realtime with Socket.IO; optimistic local messages supported on the client.
- Presence: server tracks online users and emits `online_users`, `user_online`, and `user_offline` events.
- Typing indicators: `typing` and `stop_typing` events are emitted and broadcast to conversation participants.
- Read receipts: clients emit `mark_read`; server updates message `status` and emits `messages_read`.
- Media uploads: server supports uploads via Cloudinary (credentials are required for upload to work).

Architecture & important files
-----------------------------
- Frontend (client)
	- Entry: [client/src/main.jsx](client/src/main.jsx)
	- Socket connection and handlers: [client/src/services/socket/socket.js](client/src/services/socket/socket.js) and [client/src/services/socket/SocketProvider.jsx](client/src/services/socket/SocketProvider.jsx)

- Backend (server)
	- Server bootstrap: [server/src/index.js](server/src/index.js)
	- Express app and routes: [server/src/app.js](server/src/app.js)
	- Socket setup: [server/src/socket/index.js](server/src/socket/index.js)
	- Socket handlers: [server/src/socket/handlers.js](server/src/socket/handlers.js)
	- Config: [server/src/config/config.js](server/src/config/config.js)
	- DB connection: [server/src/config/db.js](server/src/config/db.js)

Tech stack
----------
- Frontend: React 19, Vite, TailwindCSS, @tanstack/react-query, socket.io-client
- Backend: Node (ESM) + Express 5, socket.io, Mongoose, jsonwebtoken, multer, cloudinary
- Dev tools: ESLint, Vite

Quick start (how to run locally)
--------------------------------
Prerequisites: Node.js (18+), npm, MongoDB available.

Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

Environment (example `server/.env`)

```env
PORT=8000
MONGODB_URL=mongodb_url
DB_NAME=rynqor

# Cloudinary (if used)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT
ACCESS_TOKEN_SECRET=some_long_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=another_long_secret
REFRESH_TOKEN_EXPIRY=7d
```

Run server and client

```bash
# Start server (from server/)
npm run dev

# Start client (from client/)
npm run dev
```

API overview (existing endpoints)
---------------------------------
- Base: `http://localhost:<PORT>/api/v1`
- Auth: `/api/v1/auth` — signup, login, refresh, logout
- Users: `/api/v1/users` — profile, search, sessions
- Conversations: `/api/v1/conversations` — list, create, participant operations
- Messages: `/api/v1/messages` — fetch messages, pagination

Realtime socket events (implemented)
-----------------------------------
- `online_users` — server → client: initial list of online user IDs
- `user_online` / `user_offline` — server → client: user presence changes
- `join_conversation` — client → server: join a conversation room (server validates membership)
- `send_message` — client → server: payload with `conversationId`, `text`, `media[]`, `clientTempId`
- `message_sent` — server → sender: ack with saved message
- `new_message` — server → room: new message for other participants
- `message_failed` — server → sender: persistent/send failure
- `mark_read` / `messages_read` — read receipts
- `typing` / `stop_typing` — typing indicators

Configuration facts
-------------------
- CORS: the server currently allows origin `http://localhost:5173` (configured in `server/src/app.js`).
- Socket client URL: the client uses `http://localhost:8000` by default (see `client/src/services/socket/socket.js`).
- Port: the server reads `PORT` from `server/src/config/config.js`.

License
-------
- No license file present in the repository.


