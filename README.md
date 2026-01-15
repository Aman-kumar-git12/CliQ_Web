# 🚀 CliQ

Connect. Share. Collaborate.

CliQ is a thread-style social and professional networking platform where users can post content, showcase their expertise, and connect with the right people to collaborate and grow together.

It blends social media engagement with professional networking, making it easy to discover people, build connections, and start meaningful conversations.


# Follow this steps to run smoothly on the hosted link..
1. When you open the website for the first time and it doesn’t load, refresh the page once.
2. If it still doesn’t load, close the tab and reopen the link. Repeat this 2–3 times if needed.
3. Make sure you have a stable and active internet connection.
4. The first request may take some time because the server is waking up — please be patient while the page loads.
5. Since images are loaded from the server, they may take a short time to appear, especially on slower connections.


# 🧩 The Problem

Today’s platforms don’t help people find the right collaborators.
People struggle with:
1. Social apps that focus on entertainment, not expertise
2. Professional networks that feel cold and inactive
3. No easy way to move from content → profile → connection → conversation
4. Communication scattered across multiple apps

Finding someone is easy.
Finding the right person is hard.



# 💡 The Solution — CliQ

CliQ brings everything into one seamless flow:
Post → Discover → Connect → Chat → Collaborate
Users can:
1. Share posts and images
2. View profiles & expertise
3. Connect with the right people
4. Chat and work together — all in one place



# 🚀 What CliQ Offers

1. 🔐 Secure Authentication -> Easy and safe Login/Signup flow to get started quickly.

2. 👤 Profile Management -> Update your personal details anytime , Display your expertise and skills  , View public profiles of other users

3. 🤝 Build Connections -> Discover People – Explore users suggested to you , Connection Requests ->Send, accept, or decline requests , My Network – View all your current connections in one place

4. 📝 Share Experiences Through Posts  -> Create and publish posts , Upload images to make posts more engaging , Personalized feed based on your connections , View individual post pages and user-specific posts.

5. 💬 Chat & Collaboration ->  Once connected, users can chat and start meaningful collaborations directly inside the platform.

6. ⚙️ Settings -> Manage account preferences and customize your experience.
7. 📱 Fully Responsive Design -> Works beautifully on desktops, tablets, and mobile devices.



# 🛠️ Tech Stack

Frontend -> React + Vite  , Tailwind CSS , React Router DOM , Context API , Axios , Lucide React,   React Icons , Framer Motion , useState , useContext , useEffect , useParams

Backend -> Node.js , Express , MongoDB , JWT Authentication




# 🌍 Live Application

Frontend:
https://cliq-web-rho.vercel.app 

Backend API:
https://cliq-backend-1.onrender.com



# 🏁 Getting Started

Follow the steps below to run the project on your machine.

✅ Requirements
Node.js (v14+)
npm or yarn

📥 Installation

Clone the repository -> git clone <repository-url> -> cd vite-project

Install dependencies -> npm install


🔑 Environment Variables

Create a .env file in the project root:

# Frontend

- VITE_BACKEND_URL="http://localhost:2001"
▶ Run Development Server -> npm run dev
🏗 Create Production Build -> npm run build

# Backend

- DATABASE_URL
- JWT_SECRET_KEY
- FRONTEND_URL
- CLOUD_NAME
- CLOUD_KEY
- CLOUD_SECRET



# 📁 Project Structure

# Frontend important file
vite-project/
├── public/                 # Static public assets (icons, robots.txt)
├── src/
│   ├── api/                # Axios instance & specific API configurations
│   ├── assets/             # Global images and styling assets
│   ├── components/         # Main UI logic
│   │   ├── Authentication/ # Signup and Login logic
│   │   ├── Chat/           # Real-time messaging UI
│   │   ├── Connections/    # Networking, Requests, Discovery
│   │   ├── Mobileview/     # Mobile-specific navigation & top bar
│   │   ├── Post/           # Post creation, editing, and details
│   │   ├── shimmering/     # Loading skeletons for posts/profiles
│   │   ├── Home.jsx        # Personalized feed with scroll restoration
│   │   ├── Postcard.jsx    # Reusable post UI with interaction logic
│   │   ├── Profile.jsx     # User's own profile management
│   │   └── Sidebar.jsx     # Desktop navigation panel
│   ├── context/            # Global state (UserContext, FeedContext)
│   ├── App.jsx             # Route definitions and Providers
│   ├── Layout.jsx          # Structural wrapper for all pages
│   ├── index.css           # Tailwind CSS and global overrides
│   └── main.jsx            # Entry point for React
├── .env                    # Environment variables (Backend URL)
├── package.json            # Frontend dependencies
└── vite.config.js          # Vite configuration

# Backend important file

WebsiteBackend/
├── prisma/
│   ├── schema.prisma       # Database models (User, Post, Message, Connection, etc.)
│   └── ...
├── src/
│   ├── controllers/        # Logical handlers for API business logic
│   │   ├── authController.js       # Signup, Login, Logout, Session management
│   │   ├── chatController.js       # Real-time message storage, history, and deleting
│   │   ├── postController.js       # Feed generation, Likes, Comments, Reports
│   │   ├── profileController.js    # Fetching/Updating user profile and expertise
│   │   ├── requestController.js    # Sending, accepting, and declining connections
│   │   ├── searchController.js     # Finding people and filtering users
│   │   ├── userController.js       # General user data management
│   │   └── myConnectionController.js # Managing existing user connections
│   ├── routes/             # API Route definitions (Entry points)
│   │   ├── index.js                # Main router entry combining all routes
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── postRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── userRoutes.js
│   │   └── ...
│   ├── middlewares/        # Security and Utility layers
│   │   ├── authMiddleware.js       # JWT token verification & route protection
│   │   └── uploadMiddleware.js     # Image/File processing logic
│   ├── socket/             # Real-time WebSocket logic
│   │   └── index.js                # Socket.io event listeners (messaging, online status)
│   ├── upload/             # Local storage for user-uploaded images/media
│   ├── utils/              # Helper functions (token generation, formatters)
│   └── app.js              # Server entry point (Port: 2002)
├── .env                    # Environment variables (DB_URL, JWT_SECRET, Port)
├── package.json            # Backend dependencies and scripts
├── prisma.config.ts        # Prisma configuration
└── reproduce_random_feed.js # Internal utility for testing feed logic



# 🎯 Vision

CliQ is not just a social platform —
it is a connection engine designed to help people discover talent, build relationships, and collaborate on real ideas.

If you want, I can also create:
A backend README
A system architecture diagram
Or a startup pitch version for investors 💼