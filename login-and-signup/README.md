# Secure MERN Stack Authentication System

A production-ready full-stack authentication module built using the **MERN** stack (MongoDB, Express, React, Node.js). Featuring a beautifully clean, dark-minimal UI using modern tooling, coupled with a robust backend architecture strictly engineered for modern web security standards and scalability.

## 🚀 Features & Security Standards

### Frontend
- **React (TypeScript) & Vite**: Clean, strongly-typed frontend utilizing hyper-fast module bundling.
- **Styling**: Beautiful Dark & Minimalist aesthetics constructed solely utilizing `TailwindCSS`.
- **Shadcn UI**: Used headless and accessible Radix UI components preconfigured natively to fit our styling constraints.
- **Axios Interceptors**: Transparently grabs failed unauthorized requests (401s), hits the backend to exchange an active Refresh Cookie for a new Access Cookie, and smoothly reruns the aborted request with the user entirely unaware.

### Backend 
- **Advanced JWT Handling**: State-of-the-art token transmission heavily relying on strictly `HttpOnly` Cookies.
  - *Access Tokens* are extremely short-lived (15 min).
  - *Refresh Tokens* expire in 7 days, are tracked structurally inside MongoDB, and automatically rotate natively if breached.
- **Rate Limiting**: Brute-force protection securely capping the Auth route (`express-rate-limit`: Max 5 attempts per IP per 15 minutes).
- **Zod Defense**: Never trusting frontend validation – utilizing deep backend sanitation pipelines enforcing strict criteria (Mins. 8 Characters, Contains Number, Contains Special Character).
- **Redis Native Integration**: Logging out correctly shreds the Refresh Token in MongoDB, and stores the remainder of your active Access Token immediately inside a highly responsive Redis Blacklist cache memory block. Every subsequent action runs through this Redis cluster first ensuring `O(1)` query speed rejections.
- **MongoDB Indexing Layer**: `email` properties natively sit mapped to an `index` constraint upgrading generic database lookup arrays natively from `O(n)` directly to `O(log n)`. 

### Load Balanced Containerization
Prepared fundamentally inside the root `docker-compose.yml` and `nginx.conf` file is an architecture natively simulating Production Environments. Nginx is fully configured backwards mapping incoming loads utilizing a `least_conn` cluster balancer over a simulated pool of localized API instance architectures simulating an Auto-scaling Cloud Setup natively hitting Mongo Atlas.

---

## 🛠 Project Structure

```text
login-and-signup/
├── frontend/                # Vite React App
│   ├── src/
│   │   ├── components/ui/   # Shadcn components
│   │   ├── lib/api.ts       # Axios Config & Interceptors
│   │   └── pages/           # Login.tsx & Signup.tsx
│   └── dockerfile
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/          # Redis & MongoDB Handshake
│   │   ├── controllers/     # Authentication logic (Zod)
│   │   ├── middleware/      # Rate limits & JWT protect overrides
│   │   ├── models/          # User & RefreshToken Models
│   │   └── index.ts         # Base App Server
│   └── dockerfile
├── docker-compose.yml       # Production Setup
├── nginx.conf               # Load Balancer Configuration
└── README.md
```

## ⚙️ How To Run Locally

### 1. Configure the `.env` variables
Create `.env` files in both the frontend and backend folders. (Or verify the generated ones exist without accidentally committing them).

**`backend/.env`**
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/login-signup
REDIS_URL=redis://127.0.0.1:6379
JWT_ACCESS_SECRET=your_super_secret_access_token_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5001/api
```

*(Note: During containerized launches the `.env` parameters update their paths dynamically routing straight toward docker service hostnames.)*

### 2. Standard Development (Bare-Metal)
If you already have instances of Redis and MongoDB running natively on your system:
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### 3. Production Simulation (Docker Compose)
Tests out the entire architecture (Load Balancer, Redis, and 3x backend shards).
*(Make sure to specify an actual MongoDB Atlas connection URL locally in yaml before composing)*
```bash
docker-compose up --build
```
Navigate to `http://localhost:80` (or `http://localhost:5173` if frontend running natively outside).

---

> Remember to double check your `.env` variables have securely injected themselves safely away inside your `.gitignore` configuration before deploying this up into GitHub!
