# SMAN 1 Pamekasan - School Management System

This is the official monorepo for the **SMAN 1 Pamekasan** digital school ecosystem. It encompasses a comprehensive management dashboard, a dynamic public landing page, and a robust backend API to handle all school-related data (students, academics, alumni, and more).

## 📂 Project Structure

This monorepo is divided into three main components:

1. **`BackendLumen/`** — The core API backend powered by **Laravel Lumen 10**.
2. **`Frontend/`** — The Admin Dashboard and Student Portal powered by **React 19 + Vite**.
3. **`landingpages/`** — The public-facing Website and Landing Page powered by **React 19 + Vite + Framer Motion**.

---

## 🚀 1. Backend API (`BackendLumen/`)

The backend serves as the central data hub, providing RESTful APIs for both the Admin Dashboard and the Public Landing Page.

### Tech Stack
- **Framework:** Laravel Lumen 10 (PHP 8.1+)
- **Database:** MySQL (`sma1_pamekasan`)
- **Authentication:** JWT via `tymon/jwt-auth`

### Key Features
- **Role-based Access Control:** Secure routes for Admin, Students, and Public.
- **Dynamic Content Management:** CMS endpoints for News, Achievements, Facilities, Programs, and Teacher profiles.
- **Optimized Data Aggregation:** Aggregated endpoints (e.g., `/api/public/landing-data`) for ultra-fast frontend performance.
- **AI Excel Import:** Automated student data insertion via spreadsheet uploads.

### Running Locally
```powershell
cd BackendLumen
composer install

# Copy .env.example to .env and configure your DB
cp .env.example .env

# Run migrations and seed data
php artisan migrate:fresh --seed

# Start the built-in server
php -S localhost:8000 -t public
```

---

## 💻 2. Admin Dashboard (`Frontend/`)

A comprehensive dashboard for school administrators to manage students, academic years, landing page content, and alumni tracking.

### Tech Stack
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 + Bootstrap 5.3 Icons
- **Routing:** React Router v7
- **State & Auth:** React Context + `localStorage` JWT

### Running Locally
```powershell
cd Frontend
npm install --legacy-peer-deps

# Start the dev server
npm run dev
```

---

## 🌐 3. Public Website (`landingpages/`)

The modern, highly-interactive landing page designed to attract prospective students and showcase the school's achievements.

### Tech Stack
- **Framework:** React 19 + Vite 8
- **Animations:** Framer Motion & GSAP (ScrollTrigger)
- **Styling:** Tailwind CSS
- **Features:** Dynamic Hero slider, animated statistics, interactive program showcases, and real-time news updates.

### Running Locally
```powershell
cd landingpages
npm install --legacy-peer-deps

# Start the dev server
npm run dev
```

---

## ☁️ CI/CD & Deployment

This project utilizes GitHub Actions (`.github/workflows/deploy-frontend.yml`) for automated deployments to a VPS.

- **Trigger:** Pushes or Pull Requests to the `main` branch.
- **Process:** Builds the React applications and deploys them alongside the Lumen backend via SSH/SCP.

---

## 🤝 Contribution Guidelines
1. Ensure you are working on a dedicated feature branch.
2. For frontend changes, make sure `npm run build` succeeds locally before pushing.
3. Keep the backend migrations clean. Avoid creating multiple `add_column` migrations; squash them into the main `create_table` file when possible during early development.
