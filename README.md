# 🚀 CliQ

**Connect. Share. Collaborate.**

CliQ is a modern social + professional networking platform where users can post content, showcase their expertise, build meaningful connections, and collaborate through real-time chat. It brings together content sharing, networking, messaging, and AI assistance into one connected experience.

---

## 🧩 The Problem
Today’s platforms make communication easy, but meaningful collaboration is still hard.
- **Social Apps**: Focus more on entertainment than expertise.
- **Professional Platforms**: Feel static and inactive.
- **Disconnected Flow**: No smooth transition from discovery → understanding → reaching out.
- **Fragmented Tools**: Messaging, networking, and profile building are scattered.
- **Lack of Intelligence**: No assistant to help users communicate better or present themselves well.

---

## 💡 The Solution — CliQ
CliQ solves this by creating one seamless workflow:
**Post → Discover → Connect → Chat → Collaborate**

Users can build a professional identity around expertise, discover relevant talent through smart recommendations, and collaborate instantly with built-in AI tools.

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4ea94b?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

### AI Agent Service
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

---

## 🚀 Features

### 🏆 CliQ Premium Features & Security
- **🔐 Secure Authentication**: OTP-based verification, password resets, and Google Sign-In via OAuth.
- **⚖️ Production Hardened**: Integrated **Helmet** for security headers, **Morgan** for detailed HTTP logging, and **Rate Limiting** to prevent brute force.
- **🛡️ Dynamic CSP**: Intelligent Content Security Policy that automatically whitelists your production domains.
- **🚀 Fail-Fast Validation**: Backend ensures all critical env variables exist at startup to prevent runtime crashes.

### 👤 Profile & Expertise
- **Email As Tagline**: Profiles use the user's verified email as a primary identifier in the header for transparent networking.
- **🧠 Expertise Showcase**: A structured section for skills, projects, and achievements.
- **🤖 AI Profile Builder**: Generate high-quality expertise content instantly based on your inputs.

### 🤝 Connections & Recommendations
- **🎯 Smart Matching**: Discovery system that suggests relevant users based on professional data.
- **📊 Activity Insights**: Tracks connection interests and saves to continuously refine recommendations.

### 💬 Real-Time Collaboration
- **💬 Advanced Chat**: Instant messaging with file sharing, voice messages, and message editing/deletion.
- **✨ AI Message Assistant**: Get smart reply hints and context-aware suggestions directly inside your chat window.
- **🤖 Dedicated AI Agent**: A standalone chatbot for guidance and instant support.

---

## 🏁 Getting Started

### ✅ Requirements
- Node.js (v18+)
- npm / yarn
- MongoDB Instance
- Redis Server (Required for status tracking & caching)
- Cloudinary Account (For image & file storage)

### 📥 Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Website
   ```

2. Install dependencies:
   - **Frontend**: `cd website_Dev/vite-project && npm install`
   - **Backend**: `cd WebsiteBackend && npm install`
   - **AI Agent**: `cd WebsiteAgent && pip install -r requirements.txt`

### 🔑 Configuration
Create `.env` files based on the project requirements.

**Backend (`WebsiteBackend/.env`)**:
```env
DATABASE_URL="your-mongodb-url"
JWT_SECRET_KEY="your-secret"
FRONTEND_URL="http://localhost:5173"
REDIS_URL="redis://127.0.0.1:6379"
CLOUDINARY_URL="your-cloudinary-url"
... (plus SMTP and Google credentials)
```

### ▶ Run
Start all services for a full experience:
```bash
# Frontend
npm run dev

# Backend
npm run dev

# AI Agent
python -m src.main
```

---

## 🌍 Deployment
- **Frontend**: Optimized for **Vercel** / Netlify.
- **Backend**: Built for **Render** / Railway / DigitalOcean (supports PM2/Docker).
- **AI Agent**: Containerized and ready for cloud deployment via **Docker**.

### Production Tip 🚀
When deploying the backend, set `NODE_ENV=production` to enable high-fidelity logging and specialized security optimizations.

---

## 🎯 Vision
CliQ is not just a social platform. It is a **connection engine** built to help people discover talent, communicate better, and collaborate on real ideas in one unified experience.
