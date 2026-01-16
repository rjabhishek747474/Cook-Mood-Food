# DailyCook - AI-Powered Recipe & Nutrition App

**DailyCook** is a modern, AI-enhanced cooking assistant that helps users discover recipes based on what's in their fridge, their fitness goals, or their craving for specific cuisines and drinks.

## 🌟 Key Features

### 🥗 Smart Fridge
- **Ingredient Matching**: Enter what you have, and get recipes you can cook *right now*.
- **AI Chef**: If no exact match exists, our customized Gemini AI creates a unique recipe for you.
- **Serving Adjustments**: Automatically scale ingredients and nutrition for any number of servings.

### 💪 Fitness Kitchen
- **Goal-Based Recipes**: Get tailored meal plans for **Fat Loss**, **Muscle Gain**, or **Maintenance**.
- **Macro Tracking**: Every recipe comes with detailed protein, carb, and fat breakdowns.
- **AI Coach**: Receive daily fitness recipe recommendations and tips.

### 🌍 Application Structure
- **Global Cuisine**: Explore authentic recipes from India, Japan, Italy, Mexico, and more.
- **Drinks Bar**: Find healthy smoothies, energy boosters, and refreshing detox drinks.
- **History & Insights**: Track what you've cooked and visualize your nutritional intake.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI, TanStack Query.
- **Backend**: FastAPI (Python), Pydantic, Uvicorn.
- **AI**: Google Gemini Pro (Generative AI).
- **Data**: JSON-based storage (easy to migrate to SQL).

## 🚀 Quick Start
1. **Backend**:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. **Open**: http://localhost:3000

## 🧪 Testing
Run the comprehensive test suite to verify all systems:
```bash
cd backend
python -m pytest tests/test_comprehensive.py -v
```

## 📄 Documentation
- [Installation Guide](Install.md)
- [Setup Guide](Setup.md)
- [Project Report](Report.md)
