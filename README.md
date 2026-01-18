# DailyCook - AI-Powered Recipe & Nutrition Dashboard

**DailyCook** is a modern, AI-enhanced cooking assistant with a personalized nutrition dashboard. Discover recipes based on what's in your fridge, track your meals, set nutrition goals, and manage your healthy lifestyle.

## 🌟 Key Features

### 🥗 Smart Fridge
- **Ingredient Matching**: Enter what you have, get recipes you can cook *right now*.
- **AI Chef**: Gemini AI creates unique recipes for your ingredients.
- **Serving Adjustments**: Scale ingredients and nutrition for any serving size.

### 💪 Fitness Kitchen
- **Goal-Based Recipes**: Tailored for **Fat Loss**, **Muscle Gain**, or **Maintenance**.
- **Macro Tracking**: Detailed protein, carb, and fat breakdowns.

### 📊 Personal Dashboard (NEW)
- **User Accounts**: Signup, login with JWT authentication.
- **Meal Logging**: Track daily food intake with nutrition totals.
- **Nutrition Goals**: Set calorie/macro targets and track progress.
- **Favorites**: Save and quickly access loved recipes.
- **Admin Panel**: User management and system statistics.

### 📱 Mobile Experience (NEW)
- **Responsive Design**: Optimized for all devices with touch-friendly navigation.
- **App-Like Feel**: Native-style transitions, sticky headers, and safe-area support.
- **PWA Ready**: Installable as a progressive web app.

### 🎨 Visual & AI Enhancements
- **Aesthetic Design**: Warm "Yellow Theme" with professional food doodle patterns.
- **Reliable AI**: Robust generation with smart fallback system ensures you always get a recipe.
- **Global Cuisine**: Authentic recipes from India, Japan, Italy, Mexico, and more.
- **Drinks Bar**: Healthy smoothies, energy boosters, and detox drinks.
- **History & Insights**: Track cooking history and visualize trends.


---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI, TanStack Query, Zustand
- **Backend**: FastAPI, SQLModel, SQLite, Pydantic, JWT Auth
- **AI**: Google Gemini Pro
- **Deployment**: Docker & Docker Compose

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
docker-compose up -d
docker-compose exec backend python -m scripts.seed_data
```
Open: http://localhost:3000

### Option 2: Manual Setup
```bash
# Backend
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m scripts.seed_data  # Create test users
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```
Open: http://localhost:3000

## 🔐 Test Credentials
| Role | Email | Password |
|------|-------|----------|
| User | test@test.com | test123 |
| Admin | admin@dailycook.com | admin123 |

## 🧪 Testing
```bash
cd backend
python -m pytest tests/test_comprehensive.py -v   # Core tests
python -m pytest tests/test_dashboard.py -v       # Dashboard tests
```

## 📄 Documentation
- [Installation Guide](Install.md)
- [Setup Guide](Setup.md)
- [Project Report](Report.md)
