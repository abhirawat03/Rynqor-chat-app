# 📱 Rynqor Chat Client

The frontend client for **Rynqor**—a MERN real-time chat application. Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **TanStack React Query v5** to deliver a responsive, performant, and resilient user experience.

---

## 🚀 Key Architectural Features

- **Real-Time Synchronized Gateway:** Implements a single-instance Socket.IO connection wrapped in a React Context, automatically synchronizing user presence, message receipt, typing states, and handling tab-visibility state syncing.
- **Optimistic UI Engine:** Messages appear instantly in the chat view with a `sending` state. In case of socket delivery failure, the UI rolls back automatically and labels the message as `failed`.
- **Session Recovery Guard:** Configures `retry` limits on the current user query to coordinate with the Axios token-refresh interceptor. This prevents accidental redirects to the login screen when access tokens are silently refreshed in the background.
- **Direct Client-to-Cloud Uploads:** Uploads message media directly to Cloudinary using secure backend-signed credentials, completely bypassing the Express server's memory and disk systems. Includes a parallel queue that aggregates upload progress for a smooth single-bar UI indicator.
- **Inverted Virtualized Feeds:** Implements `react-virtuoso` for smooth, lag-free scrolling through thousands of messages, using inverse scrolling behavior for instant bottom pinning.
- **Resilient Panel Boundaries:** Utilizes panel-level React `ErrorBoundary` wrappers to prevent isolated component crashes from disrupting root-level navigation.
- **Zero-Flicker Themes:** Synchronizes system theme preferences (dark/light mode) with CSS Custom Properties and direct class injection, eliminating paint flashes during initial page load.
- **Client-Side File Safeguards:** Validates media uploads (file size bounds, blacklisted MIME types, extensions) on the client before network transmission.

---

## 🛠️ Technology Stack

| Library / Tool | Version | Purpose |
| :--- | :--- | :--- |
| **React** | 19.0.0 | Component rendering & concurrent features |
| **Vite** | 6.0.0 | High-performance bundling & HMR dev server |
| **Tailwind CSS** | v4.0 | Modern utility-first CSS styling engine |
| **TanStack Query** | v5.0 | Server-state caching, synchronization, & optimistic mutations |
| **Socket.io Client**| v4.8 | Low-latency bi-directional WebSocket connection |
| **React Virtuoso** | v4.7 | Efficient rendering of large virtualized message histories |

---

## 📂 Directory Layout & Modules

```text
client/src/
├── components/          # Modular, reusable UI components
│   ├── app/             # Application shell controls (headers, disconnect overlays)
│   ├── chat/            # Chat interfaces (message lists, text inputs, message bubbles)
│   └── common/          # Layout wrappers (error boundaries, loading skeletons, modal dialogs)
│
├── constants/           # Global client constraints
│   └── upload.js        # File limits, size bounds, and blocked extensions
│
├── context/             # React Context definitions
│   └── ThemeContext.jsx # Light/dark mode configuration and OS synchronization
│
├── hooks/               # Domain-specific React Query / Mutation wrappers
│   ├── auth/            # Authenticated user profiles, session query hooks
│   ├── conversations/   # Chat room management, direct messaging hook pipelines
│   └── messages/        # Paginated message retrieval and media upload mutations
│
├── layouts/             # Multi-panel shell layouts (AppLayout, ChatLayout)
│
├── pages/               # Top-level route pages (Chats, Profiles, UserSearch)
│
├── routes/              # Client routing and Route Shield middleware
│   ├── ProtectedRoute   # Rejects unauthenticated connections
│   └── PublicRoute      # Redirects logged-in users away from auth gates
│
└── services/            # API client layers and real-time gateways
    ├── api.js           # Axios interceptor for automated, silent token rotation
    └── socket/          # Socket initialization, event handler hooks, and query cache invalidations
```

---

## ⚡ Client-Side Data & Caching Pipeline

Rynqor separates network requests from component UI elements using a three-tier architecture:
`UI Component` ➔ `Custom Hook (Query/Mutation)` ➔ `REST/Socket API Service`

### TanStack Query Cache Structure

- **Active Conversations (`["conversations"]`):** Keeps track of all open chat threads. New socket messages trigger cache invalidations, re-sorting conversations dynamically by the latest message timestamp.
- **Paginated Message Feed (`["messages", conversationId]`):** Uses cursor-based pagination parameters (`pageParam`) to request subsequent pages as the user scrolls up. Configured with a `staleTime` of 5 minutes to prevent redundant network fetches during in-session room switching while keeping history fresh.
- **Cached User Profiles (`["user", userId]`):** Tuned with a `staleTime` of 24 hours to match the server-side Redis cache TTL, eliminating wasteful client-side refetches for static user profile metadata.
- **Cache Handlers:** When messages are sent/received, helper modules (`updateMessagesCache.js`, `updateConversationCache.js`) manipulate the TanStack cache directly, avoiding expensive full-page refetches.

### Direct-to-Cloud Upload Pipeline

The client bypasses the server for all media and avatar file processing:
1. Requests a secure, temporary upload signature from Express (`GET /messages/upload-signature?type=avatar|message`). The query type determines the target Cloudinary folder (`Rynqor/avatar` or `Rynqor/messages`) and enforces strict image validation for avatars.
2. Concurrently sends file binaries directly to Cloudinary using standard `multipart/form-data` POST requests.
3. Computes the combined upload progress in real-time by tracking loaded/total bytes dynamically across all concurrent requests to avoid progress values exceeding 100%.
4. Returns the validated URLs and media details to the mutation for storage in MongoDB.

---

## 💻 Local Development & Configuration

### Prerequisites
Ensure you have the backend server up and running, and the necessary ports exposed.

### Install Client Dependencies
From the root workspace folder, or the `/client` directory:
```bash
cd client
npm install
```

### Script Directory

- **Run Dev Server:** Launches the local hot-reloading development server.
  ```bash
  npm run dev
  ```
- **Code Quality Check:** Runs ESLint rules checking code styles and React hook usage.
  ```bash
  npm run lint
  ```
- **Compile Production Bundle:** Compiles and minifies assets to `/dist` for hosting.
  ```bash
  npm run build
  ```
- **Preview Production Build:** Locally previews the production assets.
  ```bash
  npm run preview
  ```
