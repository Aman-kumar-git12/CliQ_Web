# 🚀 CliQ

Connect. Share. Collaborate.

CliQ is a modern social + professional networking platform where users can post content, showcase their expertise, build meaningful connections, and collaborate through real-time chat.

It brings together content sharing, networking, messaging, and AI assistance into one connected experience.



# 🧩 The Problem

Today’s platforms make communication easy,
but meaningful collaboration is still hard.

People struggle with:
1. Social apps that focus more on entertainment than expertise
2. Professional platforms that feel static and inactive
3. No smooth flow from discovering someone → understanding them → reaching out
4. Messaging, networking, and profile building are scattered across different tools
5. No intelligent assistant to help users communicate better or present themselves well

Finding people is easy.
Finding the right people, and knowing how to start, is hard.



# 💡 The Solution — CliQ

CliQ solves this by creating one seamless workflow:
Post → Discover → Connect → Chat → Collaborate

Users can:
1. Share updates and ideas through posts
2. Build a profile around expertise, not just identity
3. Discover relevant people through smart recommendations
4. Start real conversations through built-in chat
5. Use AI to improve profiles, replies, and collaboration flow



# 🚀 What CliQ Offers

1. 🔐 Secure Authentication -> Easy and safe Signup/Login flow with protected sessions, email verification, password reset, and Google Sign-In.

2. 👤 Profile Management -> Update personal details anytime, upload profile images, manage expertise, and view public profiles of other users.

3. 🧠 Expertise Showcase -> Users can highlight their skills, projects, achievements, interests, and professional identity in a structured expertise section.

4. 🤖 AI Expertise Generator -> Users can generate expertise content with AI based on their answers, making profile building faster and smarter.

5. 🤝 Build Connections -> Discover people, send connection requests, accept or reject requests, and manage your network in one place.

6. 🎯 Smart Connection Recommendations -> CliQ suggests relevant people using recommendation logic, preference tracking, ranking, and feedback-based improvement.

7. 📊 Recommendation Insights -> The system tracks recommendation actions like shown, saved, ignored, and interested to improve the connection experience over time.

8. 📝 Share Experiences Through Posts -> Create and publish posts, upload images, browse feeds, open individual post pages, and explore user-specific posts.

9. 💬 Real-Time Chat & Collaboration -> Once connected, users can chat instantly, send files, share images, send voice messages, edit messages, delete messages, and continue conversations in real time.

10. ✨ AI Message Assistant -> Inside chat, users can generate smart reply suggestions, ask AI about conversation context, and get help deciding what to say next.

11. 🤖 AI Agent Chatbot -> Users can interact with the CliQ AI Agent through a dedicated AI chat experience for guidance, idea generation, and support.

12. ⚙️ Settings & Account Control -> Manage account preferences, blocked account flows, and account-level actions from one place.

13. 📱 Fully Responsive Design -> Works smoothly across desktop, tablet, and mobile devices.



# 🤖 AI Features

CliQ includes a dedicated AI layer that supports profile building, communication, and discovery.

Users can use AI for:
1. Generating expertise/profile content
2. Asking AI to understand conversation context
3. Getting smart reply suggestions in chat
4. Streaming AI responses in real time
5. Talking to the CliQ AI Agent directly
6. Improving matching and recommendation quality

AI in CliQ is not just an extra chatbot.
It is integrated into the product experience to make collaboration easier and more intelligent.



# 🛠️ Tech Stack

Frontend -> React + Vite, Tailwind CSS, React Router DOM, Context API, Axios, Framer Motion, Lucide React, React Icons, Socket.IO Client

Backend -> Node.js, Express, Prisma, MongoDB, JWT Authentication, Socket.IO, Cloudinary, Redis, Helmet, Morgan, Express Rate Limit

AI Agent Service -> Python, FastAPI, LangChain, Groq, message assistant service, expertise generation service, matching service



# 🌍 Live Application

Frontend:
https://cliq-web-rho.vercel.app

Backend API:
https://cliq-backend-1.onrender.com

AI Agent:
Connected through the backend proxy and local AI service configuration



# 🏁 Getting Started

Follow the steps below to run the project on your machine.

✅ Requirements
1. Node.js (v18+ recommended)
2. npm or yarn
3. Python
4. MongoDB database connection
5. Redis server
6. Cloudinary account



📥 Installation

Clone the repository -> `git clone <repository-url>`

Move into the main project folder -> `cd Website`

Install dependencies:
1. Frontend -> `cd website_Dev/vite-project && npm install`
2. Backend -> `cd ../../WebsiteBackend && npm install`
3. AI Agent -> `cd ../WebsiteAgent && pip install -r requirements.txt`



# 🔑 Environment Variables

Create the required `.env` files for each service.

# Frontend -> `website_Dev/vite-project/.env`

1. `VITE_BACKEND_URL=http://localhost:2004`
2. `VITE_LLM_API_URL=http://localhost:8000`



# Backend -> `WebsiteBackend/.env`

1. `DATABASE_URL=your_mongodb_connection_string`
2. `JWT_SECRET_KEY=your_jwt_secret`
3. `PORT=2003`
4. `FRONTEND_URL=http://localhost:5173`
5. `REDIS_URL=redis://127.0.0.1:6379`
6. `CLOUD_NAME=your_cloudinary_name`
7. `CLOUD_KEY=your_cloudinary_key`
8. `CLOUD_SECRET=your_cloudinary_secret`
9. `LLM_SERVICE_URL=http://localhost:8000`
10. `GOOGLE_CLIENT_ID=your_google_client_id`
11. `GOOGLE_CLIENT_SECRET=your_google_client_secret`
12. `GOOGLE_REDIRECT_URI=http://localhost:2003/auth/google/callback`
13. `SMTP_HOST=your_smtp_host`
14. `SMTP_PORT=587`
15. `SMTP_SECURE=false`
16. `SMTP_USER=your_smtp_user`
17. `SMTP_PASS=your_smtp_password`
18. `SMTP_FROM=your_sender_email`



# AI Agent -> `WebsiteAgent/.env`

1. `FRONTEND_URL=http://localhost:5173`
2. `GROQ_API_KEY=your_groq_api_key`
3. `MESSAGE_ASSISTANT_CLASSIFIER_MODEL=llama-3.1-8b-instant`
4. `MESSAGE_ASSISTANT_RESPONSE_MODEL=llama-3.1-8b-instant`
5. `MESSAGE_ASSISTANT_FALLBACK_MODEL=llama-3.1-8b-instant`



# ▶ Run Development Servers

Run each service separately:

1. Frontend
   `cd website_Dev/vite-project`
   `npm run dev`

2. Backend
   `cd ../../WebsiteBackend`
   `npm run dev`

3. AI Agent
   `cd ../WebsiteAgent`
   `./start_agent.sh`



# 🔄 Local Service Flow

CliQ works through 3 connected services:
1. Frontend runs on `http://localhost:5173`
2. Backend runs on `http://localhost:2003` and may retry on the next port if `2003` is already occupied
3. AI Agent runs on `http://localhost:8000`

How they connect:
1. Frontend sends API requests to the backend using `VITE_BACKEND_URL`
2. Backend communicates with MongoDB, Redis, and Cloudinary
3. Backend communicates with the AI service using `LLM_SERVICE_URL`
4. AI chat traffic is proxied through the backend to the AI agent

If you use the default local setup, make sure your frontend `VITE_BACKEND_URL` matches the backend port you are actually using.



# 🏗 Create Production Build

Frontend build:
`npm run build`

Backend build step:
`npm run build`

AI Agent:
Run with Uvicorn or containerize using the provided Dockerfile



# 🌍 Deployment

Frontend -> Optimized for Vercel / Netlify

Backend -> Suitable for Render / Railway / DigitalOcean / VPS deployment

AI Agent -> Can be deployed separately using Docker or Uvicorn-based hosting

Production tip:
Set `NODE_ENV=production` in the backend for production cookie settings, optimized middleware behavior, and production logging mode.



# 📁 Project Structure

# Frontend important files
vite-project/
├── public/                  # Static public assets
├── src/
│   ├── api/                 # Axios client and API helpers
│   ├── components/          # Main UI logic
│   │   ├── Authentication/  # Signup, login, OTP, Google auth UI
│   │   ├── Chat/            # Real-time chat UI + AI message assistant overlay
│   │   ├── Chatbot/         # Dedicated AI chatbot interface
│   │   ├── Connections/     # Discovery, recommendations, requests, saved lists
│   │   ├── MobileviewFolder/# Mobile navigation and mobile top bar
│   │   ├── MyExperties/     # Expertise creation, editing, AI expertise flow
│   │   ├── Post/            # Post creation, editing, details, reports, likes
│   │   ├── shimmering/      # Loading skeleton components
│   │   ├── Home.jsx         # Main feed and homepage experience
│   │   ├── Messages.jsx     # Inbox entry screen
│   │   ├── profile.jsx      # User’s own profile page
│   │   └── PublicProfile.jsx# Public profile view
│   ├── context/             # Global state (UserContext, FeedContext)
│   ├── App.jsx              # Route definitions and providers
│   ├── Layout.jsx           # Common page structure
│   ├── index.css            # Global styles
│   └── main.jsx             # Frontend entry point
├── .env                     # Frontend environment variables
├── package.json             # Frontend scripts and dependencies
└── vite.config.js           # Vite configuration



# Backend important files

WebsiteBackend/
├── prisma/
│   ├── schema.prisma        # Database models for users, posts, chat, AI history, recommendations
│   ├── prismaClient.js      # Prisma client setup
│   └── seed.js              # Seed helpers
├── src/
│   ├── controllers/         # Business logic handlers
│   │   ├── auth/            # Signup, login, OTP, password reset, verification
│   │   ├── recommendations/ # Recommendation actions, preferences, cache helpers
│   │   ├── aiChatController.js
│   │   ├── chatAssistantController.js
│   │   ├── conversationController.js
│   │   ├── expertiseController.js
│   │   ├── messageController.js
│   │   ├── postCrudController.js
│   │   ├── postFeedController.js
│   │   ├── postInteractionController.js
│   │   ├── profileController.js
│   │   ├── recommendationAnalyticsController.js
│   │   ├── recommendationFeedController.js
│   │   ├── recommendationPreferenceController.js
│   │   ├── searchController.js
│   │   └── userController.js
│   ├── middlewares/         # Auth and validation middleware
│   ├── routes/              # API route definitions
│   ├── socket/              # Socket.IO real-time messaging logic
│   ├── upload/              # Upload and cloud storage integration
│   ├── utils/               # Utility helpers for auth, mail, recommendations
│   └── app.js               # Backend entry point
├── .env                     # Backend environment variables
├── package.json             # Backend scripts and dependencies
├── prisma.config.ts         # Prisma configuration
└── notes.md                 # Backend notes and planning



# AI Agent important files

WebsiteAgent/
├── src/
│   ├── core/                # Core AI agent logic
│   ├── rag/                 # Retrieval and prompt support files
│   ├── routes/              # AI routes for chat, expertise, matching, message assistant
│   ├── services/            # AI services for expertise, message help, matching
│   └── main.py              # FastAPI entry point
├── .env                     # AI service environment variables
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container setup for agent deployment
└── start_agent.sh           # Agent startup helper



# 🧭 System Flow

Frontend -> Backend API -> MongoDB / Redis / Cloudinary / AI Agent

CliQ works as a multi-service product:
1. Frontend handles UI, routing, and user interactions
2. Backend manages authentication, posts, chat, profiles, and recommendations
3. AI Agent service powers chatbot, message assistance, expertise generation, and matching
4. Backend acts as the bridge between the frontend and the AI service



# 🚧 Future Improvements

1. Improve deployment documentation for frontend, backend, and AI services separately
2. Expand AI configuration docs with provider options and model tuning guidance
3. Add architecture diagrams for chat, recommendations, and AI request flow
4. Add contributor setup instructions and API route documentation



# 🎯 Vision

CliQ is not just a social platform.
It is a connection engine built to help people discover talent, communicate better, and collaborate on real ideas in one unified experience.
