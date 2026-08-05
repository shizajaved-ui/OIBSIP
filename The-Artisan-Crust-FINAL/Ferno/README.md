# The Artisan Crust 🍕

The Artisan Crust is a production-grade, full-stack pizza ordering and inventory management platform. Built as part of the Oasis Infobyte SIP (Level 3 Task 1), it features a custom pizza builder, real-time order tracking, and a comprehensive admin dashboard for stock management.

## 🚀 Features

### User Side
- **Seamless Auth**: Secure registration with email verification and JWT-based authorization.
- **Pizza Builder**: A multi-step interactive flow to customize base, sauce, cheese, and vegetables.
- **Real-time Tracking**: Live order status updates (polling) from the kitchen to delivery.
- **Payment Integration**: Razorpay API architecture implemented with a **Simulated Demo Mode** (due to regional restrictions for Razorpay in Pakistan).
- **Profile Management**: Account dashboard with order history and profile editing.

### Admin Side
- **Stock Control**: Visual dashboard for monitoring inventory levels of all pizza components.
- **Automated Alerts**: Email notifications sent via Nodemailer/Cron when stock falls below thresholds.
- **Order Management**: Panel to view incoming orders and update statuses in real-time.
- **Manual Overrides**: Capability to update stock levels and item details directly.

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Email**: Nodemailer + Node-Cron
- **Payment**: Razorpay API (Simulated/Demo Mode)

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YourUsername/OIBSIP.git
   cd OIBSIP
   ```

2. **Install Dependencies**:
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `server/` directory with the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_app_password
   ADMIN_EMAIL=admin@yourpizzashop.com
   CLIENT_URL=http://localhost:5173
   ```

4. **Seed the Database**:
   ```bash
   cd server
   node seed.js
   ```

5. **Run the Application**:
   From the root directory:
   ```bash
   npm run dev
   ```

## 🔐 Credentials for Testing

### Admin Account
- **Email**: `admin@pizzashop.com`
- **Password**: `Admin@123`

### User Account
- You can register a new user or use a seeded account if available.
- Email verification is required to see the "Verified" badge on the dashboard.

## 📄 License
This project is submitted for the Oasis Infobyte Internship Program.
