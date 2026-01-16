# Setup & Run Guide - DailyCook

Once you have installed the dependencies (see Install.md), follow these steps to run the application.

## 1. Start the Backend Server
The backend powers the AI, database, and API logic.

1. Open a terminal.
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Start the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The API will be available at http://localhost:8000*

## 2. Start the Frontend Application
The frontend provides the user interface.

1. Open a **new** terminal window.
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to: **http://localhost:3000**

## 3. How to Use DailyCook

### 🥗 Smart Fridge
- Click on "Fridge" in the navigation.
- Enter ingredients separated by commas (e.g., "chicken, rice, peppers").
- Click "Find Recipes".
- The AI will generate a custom recipe or match one from the database!

### 💪 Fitness Kitchen
- Choose your goal: **Fat Loss**, **Muscle Gain**, or **Maintenance**.
- Browse tailored recipes with macro breakdowns.
- Use the "Generate Random" button for instant ideas.

### 🌍 Cuisine Explorer
- Select a cuisine tab (e.g., Indian, Japanese).
- Browse mocked authentic recipes or generate new ones.

### 🍹 Drinks Bar
- Filter by category (Healthy, Energy, etc.).
- Get AI-powered drink recommendations.

## Troubleshooting
- **AI Error**: If recipes fail to generate, check your `backend/.env` file and ensure `GEMINI_API_KEY` is valid.
- **Connection Refused**: Ensure the backend terminal is running without errors.
