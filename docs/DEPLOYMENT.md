# Dlicom Nexus — Deployment & Operations Guide

## 1. Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 9.0.0

### Installation & Local Development
```bash
# Clone repository
git clone https://github.com/Batman-45/dlicom-nexus.git
cd dlicom-nexus

# Install dependencies
npm install

# Start Vite frontend development server
npm run dev

# (Optional) Start local Express proxy server
npm run dev:proxy
```
The application will be accessible at `http://localhost:5173`.

---

## 2. Production Build

```bash
# Type check and build production distribution
npm run build

# Preview production build locally
npm run preview
```
The compiled output is located in `dist/`.

---

## 3. Containerized Deployment (Docker)

### Build & Run via Docker
```bash
# Build Docker image
docker build -t dlicom-nexus:latest .

# Run container
docker run -d -p 3000:3000 --name dlicom-nexus-app dlicom-nexus:latest
```

### Docker Compose
```bash
# Start containerized application
docker compose up -d

# View container logs
docker compose logs -f

# Stop container
docker compose down
```

---

## 4. Static Hosting Deployment (Vercel / Cloudflare Pages / Netlify)

Dlicom Nexus is optimized for single-page application (SPA) static deployment.

### Vercel
Configuration is pre-packaged in [`vercel.json`](../vercel.json):
```bash
# Deploy via Vercel CLI
npx vercel --prod
```

### Cloudflare Pages / Netlify
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **SPA Fallback**: Route all unhandled paths (`/*`) to `/index.html`.

---

## 5. Verification & Health Gates

Run the unified regression verification suite prior to promoting any release:
```bash
npm run verify:all
```
This executes all 8 verification gates sequentially:
1. Phase 1 Mascot Generator Suite
2. Phase 1 Mascot UI Browser Audit
3. Phase 2 Pipeline Engine Suite
4. Phase 2 Pipeline Studio Browser Suite
5. Phase 3 Engine Suite
6. Phase 3 Cross-Platform 12-Route E2E Suite
7. TypeScript Strict Compilation Check (`npx tsc --noEmit`)
8. Production Vite Bundle Build (`npm run build`)
