# Setup & Run Guide - DailyCook

Once you have installed the dependencies (see Install.md), follow these steps to run the application.

## Quick Start with Docker
```bash
docker-compose up -d
docker-compose exec backend python -m scripts.seed_data
```
Open http://localhost:3000 - done!

---

## Manual Setup

### 1. Start the Backend Server
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
3. Create test users (first time only):
   ```bash
   python -m scripts.seed_data
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *API available at http://localhost:8000*

### 2. Start the Frontend
1. Open a **new** terminal.
2. Navigate to frontend:
   ```bash
   cd frontend
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open: **http://localhost:3000**

---

## How to Use DailyCook

### 🔐 Login / Signup
- Click "Login" in the navigation.
- Use test credentials: `test@test.com` / `test123`
- Or sign up for a new account.

### 📊 Dashboard
- View today's nutrition summary.
- Track goal progress (calories, protein, etc.).
- Access quick actions for logging meals.

### 🥗 Smart Fridge
- Enter ingredients (e.g., "chicken, rice, peppers").
- Get matching recipes or AI-generated ones.

### 💪 Fitness Kitchen
- Choose goal: **Fat Loss**, **Muscle Gain**, or **Maintenance**.
- Browse macro-optimized recipes.

### ❤️ Favorites
- Save recipes you love.
- Quick access from Favorites page.

### 🛡️ Admin Panel (Admin Only)
- Login as `admin@dailycook.com` / `admin123`
- Navigate to `/admin`
- View user stats, manage users.

---

## Troubleshooting
- **401 Errors**: Token expired. Log out and log in again.
- **AI Error**: Check `GEMINI_API_KEY` in backend `.env`.
- **Connection Refused**: Ensure backend terminal is running.
