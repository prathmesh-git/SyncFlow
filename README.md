# 🔄 SyncFlow

**SyncFlow** is a real-time collaborative task manager built with the MERN stack and powered by Socket.IO. It allows teams to manage tasks across a Kanban board with drag-and-drop support, conflict handling, smart assignment, and a real-time activity log.

## 🚀 Live Demo

- 🔗 **Frontend**: [sync-flow-seven.vercel.app](https://sync-flow-seven.vercel.app)  
- 🔗 **Backend**: [syncflow-zfy0.onrender.com](https://syncflow-zfy0.onrender.com)  
- 💻 **GitHub Repo**: [github.com/prathmesh-git/SyncFlow](https://github.com/prathmesh-git/SyncFlow)

## 📌 Features

### ✅ Core Functionality

- 🔐 **JWT Authentication**: Secure login/register flow.
- 📋 **Kanban Task Board**: Tasks are categorized under `Todo`, `In Progress`, and `Done`.
- 📤 **Drag & Drop**: Tasks can be moved across columns.  
  ⚠️ *Note: Dragging is only supported from the **task title area**.*
- 👥 **Smart Assign**: Automatically assign a task to the user with the fewest active tasks.
- 📝 **Activity Log**: Tracks all changes like task creation, updates, deletion, and smart assignment in real-time.
- ⚔️ **Conflict Detection**: Prevents data overwrites when multiple users edit the same task.
- 📱 **Fully Responsive**: Works well on mobile and desktop devices.

## ⚙️ Tech Stack

### Frontend
- React
- Vite
- Axios
- Socket.IO Client
- DnD Kit

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- Socket.IO
- JWT for auth
- Render (deployment)

## 📸 Screenshots

> Screenshots available in the deployment section or demo video.

## 🔐 User Roles

- Anyone can **Register/Login**
- Users can only manage their own assigned tasks

## 🧪 How to Test Conflict

> Log in with two users and try updating the same task simultaneously. The system will detect the timestamp mismatch and prompt for overwrite confirmation.

## 🛠️ Local Setup

```bash
# Clone the repo
git clone https://github.com/prathmesh-git/SyncFlow.git
cd SyncFlow

# Install frontend
cd frontend
npm install
npm run dev

# In a new terminal tab, install backend
cd ../backend
npm install
npm run dev


📌 Notes
Drag and drop only works when you drag from the title section of a task card.

Use the “Smart Assign” button to balance workload across users.

Task updates include live sync, conflict handling, and action logs.

🙌 Credits
Developed as part of an assignment project by Prathmesh.