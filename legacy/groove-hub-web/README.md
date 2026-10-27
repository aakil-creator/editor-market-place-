# GROOVE HUB — Instagram Reels Studio (Chennai)

Production marketing website for **GROOVE HUB**, an on-location Instagram reels studio in Chennai, India.

---

## 🚀 Why Move Off Render's Free Tier?

Render's free tier spins down (sleeps) when inactive for 15 minutes. When a prospective client taps your link on Instagram or WhatsApp, the server can take **50–90 seconds** to wake up ("cold start"), causing high drop-offs.

Because this project is built with Next.js and optimized for static delivery, you can host it **100% free with instant (<100ms) page loads** on:

### Option A: Vercel (Recommended — Free & Instant)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import this repository and set the **Root Directory** to `groove-hub-web`.
4. Click **Deploy**. Vercel serves the website globally via their edge CDN with zero cold starts.

### Option B: Cloudflare Pages (Free & Unlimited Bandwidth)
1. In Cloudflare Dashboard, go to **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect your GitHub repository.
3. Set **Root directory**: `groove-hub-web`.
4. Set **Build command**: `npm run build` and **Output directory**: `.next`.
5. Deploy.

### Option C: GitHub Pages (Free Static Hosting)
1. In `next.config.ts`, set `output: "export"`.
2. Run `npm run build` to generate the `/out` directory.
3. Deploy the `/out` directory to GitHub Pages.

---

## ⚙️ Configuration (`site.config.ts`)

All business settings, WhatsApp numbers, prices, and copy are managed from **one central file**:  
📁 [`site.config.ts`](./site.config.ts)

| Field | Description | Current Value |
| :--- | :--- | :--- |
| `whatsappNumber` | Official WhatsApp business phone (digits only, no +) | `"919344097774"` |
| `email` | Optional studio email. If empty string `""`, cleanly hidden from UI | `""` *(hidden)* |
| `instagramHandle` | Optional Instagram handle. If empty string `""`, cleanly hidden from UI | `""` *(hidden)* |
| `packages[i].price` | Optional package price. If empty `""`, displays **"Pricing on request"** | `""` *(Pricing on request)* |

---

## 🎬 How to Compress Videos for Free (Under 8 MB)

To maintain a Lighthouse mobile score of **90+**, all reel videos should be compressed under **8 MB** before placing them in `public/reels/`.

### Method 1: Free FFmpeg Command Line
If you have `ffmpeg` installed, run:
```bash
ffmpeg -i input.mp4 -c:v libx264 -profile:v high -preset slow -crf 23 -maxrate 3.5M -bufsize 7M -pix_fmt yuv420p -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:a aac -b:a 128k -movflags +faststart output.mp4
```

### Method 2: Free HandBrake GUI (Mac / Windows / Linux)
1. Download [HandBrake](https://handbrake.fr/) (100% free & open-source).
2. Drag your video into HandBrake.
3. In **Dimensions**, ensure resolution is **1080 x 1920** (Vertical 9:16).
4. In **Video**, set:
   - Video Codec: **H.264 (x264)**
   - Framerate: **30 FPS (Constant Framerate)**
   - Quality: **Constant Quality RF 22–24**
   - Encoder Preset: **Slow**
5. Check **Web Optimized** (enables fast playback start).
6. Click **Start Encode**. The resulting file will be ~4–7 MB with crisp mobile quality.

### Generating Posters from Video Frames:
To extract a high-quality poster frame at second 2:
```bash
ffmpeg -ss 00:00:02 -i public/reels/reel-1.mp4 -vframes 1 -q:v 2 public/posters/reel-1.jpg
```

---

## 📂 Video Files in `/public/reels`
- `reel-1.mp4` — Primary location reel (used in hero phone frame and showcase).
- `reel-2.mp4` — Secondary technique reel (used in showcase).
- `reel-1.jpg` & `reel-2.jpg` in `/public/posters/` — Preloaded thumbnail posters.
- Note: The "Raw vs Final" slider automatically stays hidden unless both `/reels/raw-footage.mp4` and `/reels/final-cut.mp4` exist.

---

## 🛠️ Local Development

```bash
cd groove-hub-web
npm install
npm run dev
```

Run production build:
```bash
npm run build
npm start
```
