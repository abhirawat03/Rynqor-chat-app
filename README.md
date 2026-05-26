# Rynqor — Real-time Chat App

A realtime, threaded chat application built with a React + Vite frontend and an Express + Socket.IO backend. Supports auth, conversations, messages, typing indicators, presence, read receipts and media uploads (Cloudinary).

**Status:** Works locally. See quick-start for running both client and server.

**Features**
- Auth (signup / login) with access & refresh tokens
- Conversations with participants and threaded messages
- Real-time messaging using Socket.IO
- Presence (online/offline), typing indicators and read receipts
- Media upload (Cloudinary)
- REST API for users, conversations and messages

**Tech stack**
- Frontend: React 19, Vite, TailwindCSS, react-query
- Backend: Node 18+, Express 5, Mongoose (MongoDB), Socket.IO
- Media/storage: Cloudinary

Repository layout
- client/ — React/Vite frontend ([client/package.json](client/package.json))
- server/ — Express API + Socket.IO backend ([server/package.json](server/package.json))

Quick start (development)

Prerequisites
- Node (18+) and npm
- MongoDB running and reachable
- Cloudinary account for media uploads (optional for image uploads)

1) Install dependencies

```bash
# from repo root
cd server
npm install

cd ../client
npm install
```

2) Configure server environment

Create a `.env` file in `server/` with the values below (example):

```env
# server/.env
PORT=8000
MONGODB_URL=mongodb://localhost:27017
DB_NAME=rynqor

# Cloudinary (if used for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT tokens
ACCESS_TOKEN_SECRET=some_long_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=another_long_secret
REFRESH_TOKEN_EXPIRY=7d
```

Note: The server reads `PORT` from [server/src/config/config.js](server/src/config/config.js). The client socket client currently points to `http://localhost:8000` in [client/src/services/socket/socket.js](client/src/services/socket/socket.js). Ensure the server `PORT` and the client socket URL agree, or update the client socket URL accordingly.

3) Run server and client

```bash
# start server (from server/)
npm run dev

# start client (from client/)
npm run dev
```

API overview
- Base URL: `http://localhost:<PORT>/api/v1`
- Auth: `/api/v1/auth` — signup, login, refresh, logout
- Users: `/api/v1/users` — current user, profile updates
- Conversations: `/api/v1/conversations` — create/list/join conversations
- Messages: `/api/v1/messages` — fetch messages, send (server also accepts via sockets)

Realtime (Socket.IO)
Socket server is initialized in [server/src/socket/index.js](server/src/socket/index.js) and handlers are implemented in [server/src/socket/handlers.js](server/src/socket/handlers.js).

Common socket events (client ⇄ server)
- `join_conversation` — join a conversation room
- `send_message` — send message payload; server emits `message_sent` (ack to sender) and `new_message` (to room)
- `message_sent`, `new_message`, `message_failed` — message lifecycle
- `mark_read` / `messages_read` — read receipts
- `typing` / `stop_typing` — typing indicators
- `online_users`, `user_online`, `user_offline` — presence

Important files
- Server entry: [server/src/index.js](server/src/index.js)
- Express app: [server/src/app.js](server/src/app.js)
- Socket handlers: [server/src/socket/handlers.js](server/src/socket/handlers.js)
- Client socket: [client/src/services/socket/socket.js](client/src/services/socket/socket.js)
- Client app entry: [client/src/main.jsx](client/src/main.jsx)

Development notes & troubleshooting
- CORS: server allows origin `http://localhost:5173` (vite dev). Update in `server/src/app.js` if you run client on a different origin.
- Socket URL mismatch: If you change the server `PORT`, update `client/src/services/socket/socket.js`'s `io()` URL or set the server to run on the same port referenced by the client.
- Uploads: Cloudinary credentials must be set for media uploads to work; otherwise image upload features will fail gracefully (check client UI and server logs).

Contributing
- Open an issue or submit a PR. Keep changes focused and include tests where applicable.

License
- See repository for license or add a `LICENSE` file.

Acknowledgements
- Built as a MERN-style real-time chat reference application.
