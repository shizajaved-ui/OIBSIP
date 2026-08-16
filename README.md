# The Artisan Crust 🍕 | OIBSIP Level 3 Task 1

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://oibsip-production-d376.up.railway.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/YourUsername/OIBSIP)

The Artisan Crust is a production-grade, full-stack pizza ordering and inventory management platform. Developed as the final capstone project, it demonstrates a complete MERN stack architecture with real-time tracking, automated inventory alerts, and secure role-based access.

---

## 🚀 Key Features

### 👤 User Experience
- **Interactive Pizza Builder**: A multi-step flow to customize base, sauce, cheese, and toppings.
- **Secure Auth**: JWT-based registration/login with **Email Verification** (Courier API).
- **Real-time Order Status**: Live tracking dashboard (Order Received → In Kitchen → Sent to Delivery).
- **Payment Integration**: Razorpay API architecture with a **Simulated Test Mode**.
- **Account Management**: Order history, profile editing, and password reset via email.

### 🛡️ Admin Management
- **Inventory Dashboard**: Visual monitoring of all pizza components (bases, sauces, veggies).
- **Automated Low-Stock Alerts**: System triggers email notifications via `Courier API` when stock drops below thresholds.
- **Order Control Center**: Live panel to update order statuses which reflect instantly for users.
- **Stock Overrides**: Manual capability to restock and update inventory items.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Utilities**: Courier API (Emails), Node-Cron (Scheduled Jobs), JWT (Security)

---

## 📦 Deployment & Setup

### Live Deployment (Recommended)
The project is optimized for a **Unified Deployment on [Railway.app](https://railway.app/)**.
1. Connect your GitHub repository (`OIBSIP`).
2. Add the following **Environment Variables** in the Railway "Variables" tab:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure random string.
   - `COURIER_AUTH_TOKEN`: Your Courier API published key.
   - `SMTP_USER`: The Gmail address connected to your Courier integration.
   - `CLIENT_URL`: Your production URL (e.g. https://oibsip-production.up.railway.app).
   - `NODE_ENV`: `production`
3. The server will automatically build the React frontend and serve it.

### Local Installation
1. **Clone & Install**:
   ```bash
   git clone https://github.com/YourUsername/OIBSIP.git
   cd OIBSIP
   npm run install-all
   ```
2. **Setup Env**: Create a `.env` in `server/` using `.env.example`.
3. **Seed Database**:
   ```bash
   cd server && node scripts/seed.js
   ```
4. **Run**:
   ```bash
   npm run dev
   ```

---

## 🔐 Submission Credentials

### Admin Access
- **Email**: `admin@pizzashop.com`
- **Password**: `Admin@123`

### User Access
- You may register a new account or use:
- **Email**: `user@example.com` | **Password**: `User@123`

---

## 📄 License & Credits
Submitted by **Shiza Javed**