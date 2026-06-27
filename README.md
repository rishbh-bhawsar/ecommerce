# Ecommerce - Full Stack Application

A full-stack ecommerce platform with an **Angular** frontend and **Node.js/Express** backend, using **MySQL** as the database.

## Tech Stack

### Frontend
- Angular 20
- Angular Material
- Bootstrap 5
- Socket.io Client
- RxJS

### Backend
- Node.js + Express
- Sequelize ORM (MySQL)
- Socket.io (real-time)
- Stripe (payments)
- JWT (authentication)

## Prerequisites

- **Node.js** >= 18
- **npm**
- **MySQL** >= 8.0

---

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a MySQL database:
   ```sql
   CREATE DATABASE ecommerce_db;
   ```

4. Configure environment variables by editing `.env`:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=ecommerce_db
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   NODE_ENV=development
   FRONTEND_URL=http://localhost:4200
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

5. Run database migrations:
   ```bash
   npm run migrate
   ```

6. (Optional) Seed sample data:
   ```bash
   npm run seed
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

   The backend runs at **http://localhost:3000**.

---

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

   The frontend runs at **http://localhost:4200**.

---

## API Endpoints

| Route | Description |
|---|---|
| `/api/auth` | Authentication (register, login) |
| `/api/products` | Product CRUD |
| `/api/categories` | Category management |
| `/api/cart` | Shopping cart |
| `/api/orders` | Order processing |
| `/api/users` | User management |
| `/api/dashboard` | Admin dashboard |
| `/api/subscriptions` | Subscription management |
| `/api/email-templates` | Email templates |
| `/api/health` | Health check |

## Available Scripts

### Backend
| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |
| `npm run migrate` | Run database migrations |
| `npm run migrate:undo` | Rollback all migrations |
| `npm run seed` | Seed database with sample data |

### Frontend
| Script | Description |
|---|---|
| `ng serve` | Start dev server |
| `ng build` | Production build |
| `ng test` | Run unit tests |

<img width="1854" height="1005" alt="Screenshot from 2026-06-27 18-08-07" src="https://github.com/user-attachments/assets/ea7c5170-306a-44e2-826a-3e1b7b961354" />
<img width="1846" height="963" alt="Screenshot from 2026-06-27 18-09-23" src="https://github.com/user-attachments/assets/7fea6e5f-4bfd-41d4-9994-2af2ea5f0337" />

