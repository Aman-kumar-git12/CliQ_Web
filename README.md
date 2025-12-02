🚀 What This App Offers
🔐 Secure Authentication
Easy and safe Login/Signup flow to get started quickly.


👤 Profile Management
Update your personal details anytime.
Display your expertise and skills.
View public profiles of other users.


🤝 Build Connections
Discover People: Explore new users suggested to you.
Connection Requests: Send, accept, or decline requests smoothly.
My Network: View all your current connections in one place.


📝 Share Experiences Through Posts
Create and publish posts effortlessly.
Upload images to make posts more engaging.
Enjoy a personalized feed based on your connections.
Explore individual post pages and user-specific posts.


⚙️ Settings
Manage account preferences and customize your experience.


📱 Fully Responsive Design
Works beautifully on desktops, tablets, and mobile devices.

🛠️ Tech Stack
Frontend: React + Vite
Styling: Tailwind CSS
Routing: React Router DOM
State Management: Context API
API Calls: Axios
Icons: Lucide React, React Icons
Animations: Framer Motion


🏁 Getting Started
Follow the steps below to run the project on your machine:

✅ Requirements
Node.js (v14+)
npm or yarn


📥 Installation

Clone the repository

git clone <repository-url>
cd vite-project


Install the dependencies

npm install


Add Environment Variables
Create a .env file in the project root:

VITE_BACKEND_URL="http://localhost:2001"

Start the development server
npm run dev



Create a production build

npm run build

📁 Project Structure
src/
├── api/            # Axios setup and all API endpoints
├── assets/         # Images, fonts, and static files
├── components/     # Reusable UI components
│   ├── Authentication/
│   ├── Connections/
│   ├── Post/
│   ├── MyExperties/
│   └── ...
├── context/        # Global context providers (User, Feed, etc.)
├── Layout.jsx      # Main layout of the application
├── App.jsx         # App/router configuration
└── main.jsx        # Application entry point



