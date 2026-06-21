# Rynqor Chat Client

This is the frontend client for **Rynqor**, a real-time, high-performance MERN chat application. The client is built with **React 19**, **Vite**, **Tailwind CSS v4**, and **TanStack React Query v5** for robust server-state caching and synchronization.

---

## 🚀 Key Features

- **Real-time Synchronization:** Built-in Socket.IO state listeners, visibility handlers, and custom presence tracking.
- **Virtual List Rendering:** Inverted infinite scroll for chat feeds using `react-virtuoso` to render large chat histories without DOM lag.
- **Resilient Layout Boundaries:** Panel-level `ErrorBoundary` protection ensuring a component crash doesn't break app-wide navigation.
- **Theme System:** System-synchronized dark/light mode with CSS Custom Properties and zero-flicker client-side hydration.
- **Centralized Constraint Validation:** Shared file upload rules to prevent invalid or oversized uploads before they reach the server.

---

## 📂 Codebase Architecture

The application is structured logically to separate layout, state, routing, and data services:

```text
src/
├── components/          # Reusable UI components
│   ├── app/             # Global shell controls (AppHeader, connection banners)
│   ├── chat/            # Chat-specific views (MessageList, MessageInput, Message)
│   └── common/          # Layout utilities (ErrorBoundary, skeletons, lazy-loader)
│
├── constants/           # Global client constraints
│   └── upload.js        # File limits, size bounds, and blocked extensions
│
├── context/             # Global React contexts (ThemeContext)
│
├── hooks/               # Domain-specific React Query hooks (auth, messages, chats)
│
├── layouts/             # Multi-panel shell layouts (AppLayout, ChatLayout)
│
├── pages/               # Top-level page controllers (ProfilePage, SearchPage, ChatsPage)
│
├── routes/              # Route shielding middleware (ProtectedRoute, PublicRoute)
│
└── services/            # API integration & real-time connection state
    ├── api.js           # Deduplicated silent token refresh Axios interceptor
    └── socket/          # Socket.io client setup, event handlers, and cache helpers
```

---

## ⚡ Data Flow & Caching (TanStack Query)

Rynqor utilizes a **Three-Tier Data Architecture**:
`UI Component` ➔ `Custom hook (Query/Mutation)` ➔ `REST/Socket API Service`

### Server State Synchronizations:

- **Conversations (`["conversations"]`):** Cached list of active chats, updated optimistically on new messages and ordered by latest activity.
- **Messages (`["messages", conversationId]`):** Virtualized infinite scroll query using scroll parameters (`pageParam`).
- **Optimistic UI Updates:** Socket message acknowledgements run silent cache replacements (`updateMessagesCache`) to show delivered/sending statuses instantly.

---

## 🛠️ Local Development & Scripts

From the `client/` subdirectory, you can manage the build and code quality using the following scripts:

### Run Development Server

Launches the Vite dev server locally at `http://localhost:5173`.

```bash
npm run dev
```

### Build Production Bundle

Compiles and tree-shakes the application into optimized static assets under the `/dist` directory.

```bash
npm run build
```

### Code Linter

Runs ESLint constraints to check file formats, dependency trees, and syntax styling.

```bash
npm run lint
```
