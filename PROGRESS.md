# 📋 Tiến Trình Dự Án — Notepad App Online (Apple Notes Style)

**Ngày cập nhật:** 2026-05-12 23:59  
**Trạng thái:** 88% hoàn thành — Đã hoàn thiện Core UI, đã tách Firebase config ra .env

---

## 🎯 Mục tiêu dự án
Xây dựng ứng dụng ghi chú trực tuyến cá nhân, thiết kế tối giản Apple Notes, tối ưu iPhone 15 Pro Max, đồng bộ thời gian thực qua Firebase Firestore, **không cần đăng nhập** — bảo mật bằng Sync Key (SHA-256 hash).

---

## 🏗️ Kiến trúc hệ thống

```
React 18 + Vite 6 → Tailwind CSS 3.4 → TipTap Editor → Firebase Firestore
```

| Lớp | Công nghệ | Mục đích |
|------|-----------|----------|
| Frontend Framework | React 18 + Vite 6 | SPA, HMR, build nhanh |
| Styling | Tailwind CSS 3.4 + CSS Variables | Design tokens, Dark/Light mode |
| Rich Text Editor | TipTap 2.9 (ProseMirror) | Soạn thảo rich text Apple-style |
| Icons | Lucide React | Icon set |
| Backend | Firebase Firestore (serverless) | Lưu trữ & đồng bộ thời gian thực |
| Bảo mật | SHA-256 Hash Sync Key → Collection Path | Auth-less private data |
| Deployment | Vercel (SPA rewrite) | Hosting miễn phí |

### Data Flow
```
User nhập Sync Key → SHA-256 hash → Firestore path: sync_data/{hash}/notes/{noteId}
→ onSnapshot real-time listener → React state → UI re-render
```

### Firestore Data Model
```
sync_data/{hashKey}/
  └── notes/{auto-generated-id}
        ├── title: string
        ├── content: string (TipTap JSON HTML)
        ├── createdAt: serverTimestamp
        └── updatedAt: serverTimestamp
```

---

## 📁 Cấu trúc thư mục hiện tại

```
notepad app online/
├── .gitignore                    ✅ Hoàn thành
├── .env.example                  ✅ Firebase env template
├── PROGRESS.md                   ✅ File này
├── index.html                    ✅ PWA meta, viewport iPhone, SEO
├── package.json                  ✅ Dependencies & scripts
├── vite.config.js                ✅ React plugin, port 3000
├── tailwind.config.js            ✅ Apple Design Tokens
├── postcss.config.js             ✅ Tailwind + Autoprefixer
├── vercel.json                   ✅ SPA rewrites, security headers
├── firestore.rules               ✅ Security: chỉ cho phép sync_data/**
├── public/
│   └── manifest.json             ✅ PWA manifest
└── src/
  ├── App.jsx                   ✅ Root component + layout
    ├── main.jsx                  ✅ React entry (createElement)
    ├── index.css                 ✅ CSS variables, TipTap, Dark mode
  ├── components/
  │   ├── EmptyState.jsx        ✅ Empty state UI
  │   ├── NoteEditor.jsx        ✅ TipTap editor + toolbar
  │   ├── NoteList.jsx          ✅ Note list sidebar
  │   ├── SyncKeyModal.jsx      ✅ Sync Key modal
  │   └── ThemeToggle.jsx       ✅ Dark/Light toggle
    ├── lib/
    │   └── firebase.js           ✅ Firebase config (env) + init
    └── hooks/
    ├── useNotes.js           ✅ CRUD hook (SHA-256, onSnapshot)
    └── useTheme.js           ✅ Theme persistence hook
```

### ✅ DA TAO (Core UI)
- `src/App.jsx`
- `src/components/SyncKeyModal.jsx`
- `src/components/NoteList.jsx`
- `src/components/NoteEditor.jsx`
- `src/components/EmptyState.jsx`
- `src/components/ThemeToggle.jsx`
- `src/hooks/useTheme.js`

---

## 🔍 Chi tiết từng file đã hoàn thành

### 1. `package.json` ✅
```json
{
  "name": "notepad-app-online",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tiptap/extension-placeholder": "^2.9.1",
    "@tiptap/extension-underline": "^2.9.1",
    "@tiptap/pm": "^2.9.1",
    "@tiptap/react": "^2.9.1",
    "@tiptap/starter-kit": "^2.9.1",
    "firebase": "^10.14.1",
    "lucide-react": "^0.460.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "vite": "^6.0.1"
  }
}
```

### 2. `index.html` ✅
- Viewport tối ưu iPhone (`viewport-fit=cover`, `user-scalable=no`)
- Theme color cho Light/Dark mode
- Apple PWA meta (`apple-mobile-web-app-capable`, status bar, title)
- SEO: meta description, title "Notepad Online — Ghi chú đồng bộ"
- Font Inter từ Google Fonts
- PWA manifest link

### 3. `vite.config.js` ✅
- React plugin
- Dev server port 3000, auto-open
- Build output: `dist/`, sourcemap off cho production

### 4. `tailwind.config.js` ✅
- `darkMode: 'class'` (manual toggle)
- Custom colors via CSS variables:
  - `apple-bg-primary/secondary/tertiary`
  - `apple-text-primary/secondary`
  - `apple-accent` (vàng Apple #FFD60A)
  - `apple-danger`, `apple-success`, `apple-border`
- Font stack: `-apple-system → BlinkMacSystemFont → SF Pro Display → Inter → system-ui`
- Custom font sizes: `note-title` (17px/600), `note-body` (15px), `note-caption` (13px)
- Border radius: `note` (12px), `modal` (16px)
- Animations: `fade-in`, `slide-up`, `scale-in` với keyframes CSS

### 5. `src/index.css` ✅
- CSS custom properties cho Light mode (`:root`) và Dark mode (`.dark`)
- Màu Apple chính xác (Light: #FFFFFF bg, #F2F2F7 secondary; Dark: #1C1C1E bg, #2C2C2E secondary)
- Safe area variables cho iPhone notch/island
- TipTap/ProseMirror styling:
  - Placeholder style (`.is-editor-empty::before`)
  - Heading styles (h1/h2/h3)
  - Blockquote với accent border
  - Code & pre styling
- Note card interactions: `transform: scale(0.98)` on active, hover lift
- Toolbar button states: hover, is-active
- Modal animations: fadeIn + scaleIn

### 6. `src/lib/firebase.js` ✅
```js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### 7. `src/main.jsx` ✅
- React 18 `createRoot` API
- Wrapped in `<React.StrictMode>`
- Uses `React.createElement` (tránh lỗi JSON serialization đã gặp trước đó)
- Imports `index.css` và `App`

### 8. `src/hooks/useNotes.js` ✅
- **`hashKey(key)`**: SHA-256 hash bằng Web Crypto API → hex string
- **`useNotes(syncKey)`**: Custom hook trả về `{ notes, loading, error, createNote, updateNote, deleteNote }`
- **Real-time listener**: `onSnapshot` với query `orderBy('updatedAt', 'desc')`
- **CRUD operations**:
  - `createNote(title, content)` → `addDoc` với `serverTimestamp()`
  - `updateNote(noteId, data)` → `updateDoc` merge + update `updatedAt`
  - `deleteNote(noteId)` → `deleteDoc`
- **Cleanup**: tự động unsubscribe khi `syncKey` thay đổi hoặc component unmount
- **Edge cases**: xử lý syncKey rỗng (clear notes), error handling với `setError`

### 9. `firestore.rules` ✅
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sync_data/{hashKey} {
      allow get: if true;           // Kiểm tra tồn tại
      match /notes/{noteId} {
        allow read, write: if true; // Chỉ ai biết hashKey mới truy cập được
      }
    }
    match /{document=**} {
      allow read, write: if false;  // Chặn mọi truy cập khác
    }
  }
}
```

### 10. `vercel.json` ✅
- SPA rewrites: tất cả route → `/index.html`
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- Cache static assets (`/assets/*`) 1 năm

### 11. `public/manifest.json` ✅
- PWA manifest cơ bản với app name, icons sẽ cần thêm sau

---

## 🚀 Cách chạy dự án

### Lần đầu:
```bash
cd "d:\OTHERS\LATVAT\notepad app online"
npm install
npm run dev
```

### Development:
```bash
npm run dev
# → http://localhost:3000
```

### Build production:
```bash
npm run build
# → dist/
```

### Deploy Vercel:
```bash
npm run build
vercel --prod
# Hoặc push lên GitHub → Vercel tự deploy
```

---

## 📝 Việc cần làm tiếp theo (Next Steps)

### Ưu tiên 1: Test & Integration
1. Tao file .env tu .env.example va dien gia tri Firebase
2. Test `npm run dev` va kiem tra CRUD Firestore + TipTap autosave
3. Deploy Firestore Rules len Firebase Console/CLI
4. Test doi Sync Key va refresh app de dam bao state on dinh

### Ưu tiên 2: Polish & Extras
1. Swipe-to-delete: Touch gesture cho mobile
2. Empty state illustration: Bo sung do hoa/animation
3. Toast notifications: Thong bao khi mat ket noi, loi Firestore
4. PWA Service Worker: Offline cache

---

## 🎨 Design System Reference

### Bảng màu Apple
| Token | Light | Dark |
|-------|-------|------|
| bg-primary | #FFFFFF | #1C1C1E |
| bg-secondary | #F2F2F7 | #2C2C2E |
| bg-tertiary | #E5E5EA | #3A3A3C |
| text-primary | #000000 | #FFFFFF |
| text-secondary | #8E8E93 | #98989D |
| accent | #FFD60A (vàng) | #FFD60A |
| danger | #FF3B30 | #FF453A |
| success | #34C759 | #30D158 |

### Typography
- Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif`
- Title: 17px / 600 weight / 22px line-height
- Body: 15px / 1.5 line-height
- Caption: 13px / 18px line-height

### Spacing
- Note card padding: 12px
- Border radius: 12px (note), 16px (modal)
- Toolbar button: 36×36px

---

## 🔒 Security Notes
- **Firebase config da chuyen sang .env**. Tao file `.env` (tu `.env.example`) va dien cac bien `VITE_FIREBASE_*` truoc khi chay/deploy:
  ```
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=...
  VITE_FIREBASE_PROJECT_ID=...
  ```
  Code da dung `import.meta.env.VITE_*`.

- Firestore Rules hiện tại chỉ dựa vào **khó đoán của hashKey** (SHA-256). Với key đủ mạnh (>20 ký tự ngẫu nhiên), không ai có thể brute-force được path.

---

## ⚡ Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 2s
- Firestore real-time sync latency: < 500ms
- Bundle size: < 200KB gzipped
- Mobile-first responsive, touch-friendly

---

## 🐛 Known Issues từ session trước
1. **`main.jsx` từng bị corrupt** (JSON thay vì JSX) → Đã fix bằng `React.createElement`
2. **`useNotes.js` mới tạo** — chưa test thực tế với Firestore
3. **`firestore.rules` chưa deploy** — có thể gây lỗi "permission denied"
4. **Cần deploy Firestore Rules** qua Firebase CLI hoặc Console trước khi app hoạt động

---

## 📌 Checklist nhanh cho session tiếp theo

- [x] Đọc file `PROGRESS.md` này
- [ ] Kiểm tra `npm install` đã chạy chưa
- [x] Tạo `src/App.jsx` (root component + routing logic)
- [x] Tạo `src/hooks/useTheme.js` (dark/light toggle + localStorage)
- [x] Tạo `src/components/SyncKeyModal.jsx`
- [x] Tạo `src/components/NoteList.jsx`
- [x] Tạo `src/components/NoteEditor.jsx` (TipTap integration)
- [x] Tạo `src/components/EmptyState.jsx`
- [x] Tạo `src/components/ThemeToggle.jsx`
- [x] Tao `.env.example`
- [ ] Test `npm run dev` → fix bugs
- [ ] Deploy Firestore Rules lên Firebase Console
- [ ] Test CRUD với Firestore thực tế
- [ ] Build & deploy Vercel
- [ ] Tao `.env` tu `.env.example`

---

> **Lưu ý cho AI ở session mới:**  
> Hãy bắt đầu bằng việc đọc `PROGRESS.md` này. Project đã có foundation đầy đủ (Firebase, Tailwind, TipTap, CSS variables, hooks). Việc còn lại chủ yếu là **xây dựng các React components** và tích hợp chúng với hook `useNotes` đã có sẵn.  
> Thiết kế phải theo phong cách **Apple Notes tối giản** — nhiều khoảng trắng, typography sắc nét, animation tinh tế. Mọi component phải dùng CSS variables đã định nghĩa trong `index.css`.
