# The Artisan Crust 🍕 | OIBSIP Level 3 Task 1

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://oibsip-production-d376.up.railway.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/YourUsername/OIBSIP)

The Artisan Crust is a production-grade, full-stack pizza ordering and inventory management platform. Developed as the final capstone project for the **Oasis Infobyte SIP (Level 3 Task 1)**, it demonstrates a complete MERN stack architecture with real-time tracking, automated inventory alerts, and secure role-based access.

---

## 🚀 Key Features

### 👤 User Experience
- **Interactive Pizza Builder**: A multi-step flow to customize base, sauce, cheese, and toppings.
- **Secure Auth**: JWT-based registration/login with **Email Verification** (Nodemailer).
- **Real-time Order Status**: Live tracking dashboard (Order Received → In Kitchen → Sent to Delivery).
- **Payment Integration**: Razorpay API architecture with a **Simulated Test Mode**.
- **Account Management**: Order history, profile editing, and password reset via email.

### 🛡️ Admin Management
- **Inventory Dashboard**: Visual monitoring of all pizza components (bases, sauces, veggies).
- **Automated Low-Stock Alerts**: System triggers email notifications via `node-cron` when stock drops below thresholds.
- **Order Control Center**: Live panel to update order statuses which reflect instantly for users.
- **Stock Overrides**: Manual capability to restock and update inventory items.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Utilities**: Nodemailer (Emails), Node-Cron (Scheduled Jobs), JWT (Security)

---

## 📦 Deployment & Setup

### Live Deployment (Recommended)
The project is optimized for a **Unified Deployment on [Railway.app](https://railway.app/)**.
1. Connect your GitHub repository (`OIBSIP`).
2. Add the following **Environment Variables** in the Railway "Variables" tab:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure random string.
   - `SMTP_USER` & `SMTP_PASS`: Your email service credentials.
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
   cd server && node seed.js
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
Submitted by **Shiza Javed** for the **Oasis Infobyte Internship Program**. 
Project repository naming follows the `OIBSIP` convention as required.
