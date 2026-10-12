# Deployment Guide

Three ways to get Infinite Loop live. Pick your poison.

---

## Option 1: Cloudflare Pages (Recommended)

**Why**: Unlimited bandwidth on the free tier. 500 builds/month. Global edge network. The generous choice.

### Via Dashboard (Point & Click)

1. **Push to GitHub** (if you haven't already)
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/infinite-loop.git
   git push -u origin main
   ```

2. **Connect to Cloudflare**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages
   - Click **Create application** → **Pages** → **Connect to Git**
   - Select your repository

3. **Configure Build Settings**
   | Setting | Value |
   |---------|-------|
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

4. **Deploy**
   - Click **Save and Deploy**
   - Wait ~1 minute
   - Your site is live at `your-project.pages.dev`

### SPA Routing Fix

For client-side routing to work, create `public/_redirects`:

```
/*    /index.html   200
```

Or add to `wrangler.toml` (if using Wrangler):

```toml
[site]
bucket = "./dist"

[build]
command = "npm run build"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### Auto-Deploy

Every push to `main` triggers a new deployment. Preview URLs are created for pull requests automatically.

---

## Option 2: Vercel (Zero Config)

**Why**: The DX benchmark. Preview deployments for every PR. Just works.

### Via Dashboard

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Project**
   - Click **Add New** → **Project**
   - Select your repository
   - Vercel auto-detects Vite

3. **Configure (Optional)**
   | Setting | Value |
   |---------|-------|
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

4. **Deploy**
   - Click **Deploy**
   - Live in ~30 seconds at `your-project.vercel.app`

### Via CLI (One Command)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time will prompt for config)
vercel

# Deploy to production
vercel --prod
```

### SPA Routing Fix

Create `vercel.json` in project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures all routes (like `/the-stack`) serve `index.html` for React Router to handle.

---

## Option 3: Netlify (The OG)

**Why**: Forms, split testing, serverless functions. The feature-rich choice.

### Via Dashboard

1. **Go to [netlify.com](https://www.netlify.com)** and sign in with GitHub

2. **Add New Site**
   - Click **Add new site** → **Import an existing project**
   - Select GitHub and authorize
   - Choose your repository

3. **Configure Build Settings**
   | Setting | Value |
   |---------|-------|
   | Build command | `npm run build` |
   | Publish directory | `dist` |

4. **Deploy**
   - Click **Deploy site**
   - Live at `random-name.netlify.app`
   - (You can change the subdomain in Site settings)

### Via CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize and link to site
netlify init

# Deploy preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### SPA Routing Fix

Create `public/_redirects`:

```
/*    /index.html   200
```

Or use `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Quick Comparison

| Feature | Cloudflare Pages | Vercel | Netlify |
|---------|-----------------|--------|---------|
| **Free Tier** | Unlimited bandwidth | 100GB bandwidth | 100GB bandwidth |
| **Builds** | 500/month | 6000 min/month | 300 min/month |
| **Preview Deploys** | ✅ | ✅ | ✅ |
| **Custom Domains** | ✅ Free | ✅ Free | ✅ Free |
| **SSL** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Edge Network** | Global (300+ PoPs) | Global | Global |
| **DX** | Good | Excellent | Good |

**TL;DR**: 
- **Cloudflare** for unlimited bandwidth
- **Vercel** for best developer experience
- **Netlify** for built-in forms/functions

---

## Environment Variables

If you need environment variables (you probably don't for this project):

### Cloudflare Pages
Settings → Environment Variables → Add variable

### Vercel
Settings → Environment Variables → Add

### Netlify
Site settings → Environment variables → Add a variable

**Note**: For Vite, environment variables must be prefixed with `VITE_` to be exposed to the client:
```
VITE_API_URL=https://api.example.com
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

---

## Custom Domain

All three platforms support custom domains on free tiers:

1. Add your domain in the platform's dashboard
2. Update your DNS:
   - **CNAME**: `your-project.pages.dev` / `your-project.vercel.app` / `your-project.netlify.app`
   - Or use **A records** they provide
3. Wait for DNS propagation (usually minutes, sometimes hours)
4. SSL certificates are provisioned automatically

---

## Troubleshooting

### Routes return 404

You need the SPA redirect rule. See the "SPA Routing Fix" section for your platform.

### Build fails with "command not found: npm"

Make sure Node.js version is set correctly:
- Cloudflare: Set `NODE_VERSION` environment variable to `18` or higher
- Vercel: Uses latest LTS by default
- Netlify: Add `.nvmrc` file with `18` or set in `netlify.toml`

### Blank page after deploy

Check browser console for errors. Common causes:
- Missing redirect rules for SPA
- Wrong build output directory (should be `dist`)
- Environment variables not prefixed with `VITE_`

---

**That's it. Pick one, deploy, done.** 🚀
