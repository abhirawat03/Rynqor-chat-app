# Rynqor — Real-time Chat Application

## Overview

Rynqor is a full-stack real-time chat application built with the MERN stack, Socket.IO, and React Query. It supports instant messaging, conversation management, user presence, typing indicators, read receipts, media sharing, and optimistic UI updates for a smooth chat experience.

The application uses MongoDB for persistence, Socket.IO for realtime communication, and Cloudinary for media storage.

---

## Features

### Authentication

* User registration and login
* JWT access token authentication
* Refresh token rotation
* Protected API routes
* Session management

### Real-Time Messaging

* Instant message delivery with Socket.IO
* Optimistic message sending
* Delivery acknowledgements
* Failed message handling
* Persistent message history

### Conversations

* One-to-one conversations
* Automatic conversation creation
* Last message tracking
* Conversation sorting by activity
* Conversation metadata synchronization

### Presence System

* Online/offline user tracking
* Live presence updates
* Initial online user synchronization
* Reconnect state synchronization

### Typing Indicators

* Realtime typing status
* Automatic typing timeout cleanup
* Conversation-specific typing events

### Read Receipts

* Message read tracking
* Realtime read receipt updates
* Read status synchronization across participants

### Media Support

* Image uploads
* Video uploads
* Audio uploads
* File attachments
* Cloudinary integration

### Frontend Features

* React Query caching
* Socket state management
* Optimistic UI updates
* Infinite message hydration support
* Responsive chat interface
* Lazy-loaded media

---

## Architecture

### Frontend

#### Core Technologies

* React 19
* Vite
* TailwindCSS
* React Router
* TanStack React Query
* Socket.IO Client

#### Important Files

```txt
client/src/
│
├── main.jsx
│
├── services/
│   └── socket/
│       ├── socket.js
│       ├── SocketProvider.jsx
│       ├── SocketContext.jsx
│       ├── useSocket.js
│       ├── handlers/
│       │   ├── messageHandlers.js
│       │   ├── typingHandlers.js
│       │   └── presenceHandlers.js
│       └── helpers/
│           └── conversationHelpers.js
│
├── hooks/
│   ├── auth/
│   ├── conversations/
│   └── messages/
│
├── pages/
│   ├── chats/
│   └── chat/
│
└── components/
```

---

### Backend

#### Core Technologies

* Node.js
* Express 5
* MongoDB
* Mongoose
* Socket.IO
* JWT
* Cloudinary
* Multer

#### Important Files

```txt
server/src/
│
├── index.js
├── app.js
│
├── socket/
│   ├── index.js
│   └── handlers.js
│
├── controllers/
├── services/
├── models/
├── routes/
├── middleware/
│
├── config/
│   ├── config.js
│   └── db.js
│
└── utils/
```

---

## Realtime Flow

### Sending Messages

```txt
Client
   │
   ├─ Optimistic message added
   │
   ├─ send_message
   ▼
Socket Server
   │
   ├─ Save Message
   ├─ Update Conversation.lastMessage
   └─ Update Conversation.updatedAt
   │
   ├─ message_sent → sender
   └─ new_message → recipients
```

### Read Receipts

```txt
mark_read
    │
    ▼
Server updates messages
    │
    ▼
messages_read
    │
    ▼
All participants updated
```

### Typing Indicators

```txt
typing
    │
    ▼
Server
    │
    ▼
Other participants

stop_typing
    │
    ▼
Server
    │
    ▼
Other participants
```

---

## Socket Events

### Client → Server

| Event             | Purpose                |
| ----------------- | ---------------------- |
| join_conversation | Join conversation room |
| send_message      | Send a message         |
| typing            | User started typing    |
| stop_typing       | User stopped typing    |
| mark_read         | Mark messages as read  |
| sync_state        | Request presence sync  |

---

### Server → Client

| Event          | Purpose                |
| -------------- | ---------------------- |
| message_sent   | Sender acknowledgement |
| new_message    | Incoming message       |
| message_failed | Delivery failure       |
| messages_read  | Read receipt update    |
| typing         | User typing            |
| stop_typing    | User stopped typing    |
| online_users   | Initial presence sync  |
| user_online    | User came online       |
| user_offline   | User went offline      |

---

## Database Models

### User

```js
{
  username: String,
  fullName: String,
  email: String,
  password: String,
  avatar: {
    url: String,
    publicId: String
  },
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Notes

* Passwords are hashed using bcrypt before storage.
* Email and username are unique.
* Password field is excluded from queries by default.

---

### RefreshToken

```js
{
  user: ObjectId,
  token: String,
  device: String,
  location: String,
  ipAddress: String,
  userAgent: String,
  lastUsedAt: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Notes

* Supports multi-device authentication.
* Automatically expires using MongoDB TTL indexing.
* Stores session metadata for security and session management.

---

### Conversation

```js
{
  participants: [ObjectId],
  type: "direct" | "self",
  lastMessage: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### Notes

* `direct` represents one-to-one conversations.
* `self` represents personal note/self-chat conversations.
* `lastMessage` references the latest Message document.
* Indexed by participants for faster conversation lookups.

---

### Message

```js
{
  conversationId: ObjectId,
  senderId: ObjectId,

  text: String,

  messageType:
    "text" |
    "media" |
    "mixed",

  media: [
    {
      url: String,
      publicId: String,

      type:
        "image" |
        "video" |
        "audio" |
        "file",

      name: String,
      size: Number
    }
  ],

  status:
    "sent" |
    "read",

  createdAt: Date,
  updatedAt: Date
}
```

#### Notes

* `text` messages contain only text.
* `media` messages contain only attachments.
* `mixed` messages contain both text and attachments.
* Indexed by `conversationId` and `createdAt` for efficient message retrieval and pagination.

---

### Relationships

```txt
User
 ├── RefreshToken[]
 ├── Conversation[]
 └── Message[]

Conversation
 ├── participants -> User[]
 └── lastMessage -> Message

Message
 ├── senderId -> User
 └── conversationId -> Conversation

RefreshToken
 └── user -> User
```


---

## Environment Variables

```env
PORT=8000

MONGODB_URL=mongodb_url
DB_NAME=

ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Local Development

### Install Dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### Run Backend

```bash
cd server
npm run dev
```

### Run Frontend

```bash
cd client
npm run dev
```

---

## Default Development URLs

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:8000
```

API Base:

```txt
http://localhost:8000/api/v1
```

---

## Current Capabilities

* JWT Authentication
* Realtime Messaging
* Optimistic UI
* Presence Tracking
* Typing Indicators
* Read Receipts
* Media Sharing
* React Query Integration
* Conversation Persistence
* Socket Reconnection Handling
* Cloudinary Upload Support
