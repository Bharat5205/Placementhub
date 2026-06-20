# Campus Recruitment Management System (CRMS)

> A production-quality full-stack web application for engineering college placement management.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS + React Router v6 |
| **State** | TanStack Query + React Context |
| **Charts** | Recharts |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL (raw SQL via `pg`) |
| **Auth** | JWT + Refresh Tokens + bcrypt |

---

## 📁 Project Structure

```
placementhub/
├── client/               # React frontend (Vite)
│   └── src/
│       ├── pages/        # auth/, student/, coordinator/
│       ├── components/   # Sidebar, Modal, Pagination, etc.
│       ├── layouts/      # StudentLayout, CoordinatorLayout
│       ├── context/      # AuthContext
│       ├── services/     # Axios API calls
│       └── routes/       # Route guards
│
└── server/               # Express backend
    └── src/
        ├── controllers/  # authController, companyController, etc.
        ├── routes/       # auth, company, notification, experience, student
        ├── services/     # SQL query functions
        ├── middleware/    # auth, authorize, errorHandler
        ├── database/     # schema.sql, db.js, seed.js
        └── utils/        # pagination, appError
```

---

## ⚙️ Setup Instructions

### 1. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE crms_db;"

# Run schema
psql -U postgres -d crms_db -f server/src/database/schema.sql
```

### 2. Backend Setup

```bash
cd server

# Create .env from template
copy .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secrets

# Install dependencies (already done)
npm install

# Seed the database with sample data
node src/database/seed.js

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

---

## 👤 Login Credentials

After running the seed script:

| Role | Email | Password |
|---|---|---|
| **Coordinator** | coordinator@crms.edu | coordinator123 |
| **Student** | student@college.edu | student123 |

---

## 📦 Features

### Student Portal
- 📊 Dashboard with stats (total, upcoming, eligible companies)
- 🏢 Company listings with search, filter, pagination
- 🔍 Eligibility checker (CGPA-based)
- 🔔 Notifications with read/unread tracking
- 📝 Interview experience browser + submission (pending approval)
- 👤 Editable profile

### Coordinator Portal
- 📊 Analytics dashboard with Recharts (package distribution chart)
- 🏢 Company CRUD (add/edit/delete, file uploads)
- 🔔 Notification management (create/edit/delete)
- ✅ Experience approval workflow (pending → approved/rejected)
- 👥 Student directory with search and filters

---

## 🔒 Security
- JWT Access Tokens (15min) + Refresh Tokens (7 days)
- bcrypt password hashing (cost: 12)
- Role-based access control (RBAC)
- SQL injection prevention (parameterized queries)
- Helmet.js security headers
- CORS with origin whitelist
