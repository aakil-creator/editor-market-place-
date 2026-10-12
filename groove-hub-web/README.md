# Groove Hub — Chennai Instagram Growth Studio

A production-ready, highly animated marketing website built for **GROOVE HUB**, an Instagram Reels growth studio for local businesses in Chennai, India.

---

## ⚡ Quick Start

```bash
# Navigate to the web project
cd groove-hub-web

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## 🛠️ Where to Replace Placeholders

All contact info, prices, team details, and offer text are centralized in **one single file**:
📁 [`site.config.ts`](./site.config.ts)

| Placeholder | Location in `site.config.ts` | Example Replacement |
| :--- | :--- | :--- |
| **WhatsApp Number** | `whatsappNumber` | `"919876543210"` *(country code + 10 digits without +)* |
| **Email Address** | `email` | `"hello@groovehub.in"` |
| **Instagram Handle** | `instagramHandle` | `"@groovehub.chennai"` |
| **Instagram Profile** | `instagramUrl` | `"https://instagram.com/groovehub.chennai"` |
| **Package 1 Price** | `packages[0].price` | `"₹14,999"` |
| **Package 2 Price** | `packages[1].price` | `"₹27,999"` |
| **Package 3 Price** | `packages[2].price` | `"₹39,999"` |

---

## 🎬 How to Add Real Reels

1. Place your 9:16 vertical MP4 video files into:
   📁 `public/reels/`
   - `featured-reel.mp4` (Hero & showcase reel)
   - `raw-footage.mp4` (Raw side of comparison slider)
   - `master-reel.mp4` (Edited side of comparison slider)
2. Place video poster thumbnails (JPG) into:
   📁 `public/posters/`
   - `featured-poster.jpg`
   - `raw-poster.jpg`
   - `master-poster.jpg`
3. Update metadata in `src/components/WorkShowcase.tsx` (`client`, `result`, `tags`).

---

## 🚀 Deployment

### Option 1: Vercel (Recommended for Next.js)
1. Push repository to GitHub.
2. Import `groove-hub-web` as a project in [Vercel Dashboard](https://vercel.com).
3. Framework preset will automatically detect **Next.js**. Click **Deploy**.

### Option 2: Render
1. In Render Dashboard, click **New -> Web Service**.
2. Connect your repository and set Root Directory to `groove-hub-web`.
3. Build Command: `npm run build`
4. Start Command: `npm start`

---

## 📐 Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with custom dark cinematic design tokens
- **Smooth Scroll:** Lenis
- **Animations:** Framer Motion (60fps, GPU-accelerated, reduced-motion supported)
- **Icons:** Lucide React
