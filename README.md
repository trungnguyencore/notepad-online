# Notepad Online

A lightweight, responsive note-taking web app with real-time Firebase sync, rich-text editing, folder organization, and a simple Sync Key workflow — no account required.

**Live demo:** https://notepad-online-beta.vercel.app

Built by [@trunk.ng](https://www.instagram.com/trunk.ng/)

---

## Features

- **Real-time note sync** with Firebase Firestore
- **Sync Key workspace** — open the same notes on multiple devices using the same key
- **Rich-text editor** powered by TipTap
  - Bold / Italic / Underline
  - Headings
  - Bullet and numbered lists
  - Blockquotes
- **Automatic saving** with protection against losing drafts when switching notes quickly
- **Folder organization**
  - Create folders
  - Rename folders
  - Create notes inside a folder
  - Move notes between folders or back to **Unfiled**
- **Responsive mobile navigation**
  - Folders → Notes → Editor on phones
  - Three-pane Folders / Notes / Editor layout on desktop
- **Light / dark theme**
- **Delete confirmation** to reduce accidental note deletion
- **Mobile-friendly controls** with touch targets optimized for iPhone-sized screens
- **PWA-ready assets and metadata** for install/share presentation

> Offline note editing is not implemented yet. The app currently depends on a network connection for Firestore sync.

---

## How the Sync Key works

Notepad Online does not require user accounts.

When a Sync Key is entered, the app hashes it with **SHA-256** in the browser. The resulting hash is used as the Firestore workspace path:

```text
sync_data/{hashedSyncKey}/
├── notes/{noteId}
└── folders/{folderId}
```

Notes store an optional `folderId`, so notes created before the folder feature remain compatible and appear under **Unfiled**.

### Important security note

The Sync Key is a lightweight access mechanism, not full authentication or end-to-end encryption.

- The raw Sync Key is not used directly as the Firestore document path.
- Note content is **not end-to-end encrypted**.
- Current Firestore access rules rely on knowledge of the hashed workspace path and are intentionally simple for this personal app.

Do not treat the current design as appropriate for highly sensitive or regulated data.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| Editor | TipTap 2 |
| Database / realtime sync | Firebase Firestore |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Project structure

```text
notepad-online/
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   └── ...
├── src/
│   ├── components/
│   │   ├── FolderDialog.jsx
│   │   ├── FolderList.jsx
│   │   ├── FolderPicker.jsx
│   │   ├── NoteEditor.jsx
│   │   ├── NoteList.jsx
│   │   ├── SyncKeyModal.jsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useFolders.js
│   │   ├── useNotes.js
│   │   └── useTheme.js
│   ├── lib/
│   │   └── firebase.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── firestore.rules
├── firebase.json
├── vercel.json
├── package.json
└── vite.config.js
```

---

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/trungnguyencore/notepad-online.git
cd notepad-online
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in the Firebase web configuration values:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 4. Start the development server

```bash
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

---

## Firestore rules

The repository keeps Firestore rules in:

```text
firestore.rules
```

and links them through:

```text
firebase.json
```

The current folder implementation allows folder read/create/update operations. Folder deletion is intentionally disabled in v1.

If you are deploying to your own Firebase project and have the Firebase CLI configured:

```bash
firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

---

## Deployment

The production app is hosted on Vercel:

**https://notepad-online-beta.vercel.app**

The repository includes `vercel.json` for SPA rewrites and HTTP security/cache headers.

The current project workflow auto-deploys the `main` branch through Vercel's Git integration.

---

## Current limitations / roadmap

Some planned improvements are tracked in [`docs/TODOLIST.md`](docs/TODOLIST.md), including:

- Search
- Toast notifications
- Keyboard shortcuts
- Safe folder deletion
- Pinning and sorting notes
- Import / export
- PWA offline support
- End-to-end encryption
- Bundle/code-splitting optimization

---

## Development notes

Internal verified project state is maintained separately in:

- [`docs/PROJECT_PROGRESS.md`](docs/PROJECT_PROGRESS.md)
- [`docs/TODOLIST.md`](docs/TODOLIST.md)

These files contain implementation/testing history and are not required for normal app usage.

---

## Author

**@trunk.ng**

Instagram: https://www.instagram.com/trunk.ng/
