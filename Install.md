# Installation Guide - DailyCook

This guide covers the installation of both the backend (FastAPI) and frontend (Next.js) components of the DailyCook application.

## Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Git**
- **Google Gemini API Key** (Get one here: https://aistudio.google.com/)

---

## 1. Clone the Repository
```bash
git clone <repository-url>
cd DailyCook
```

## 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows**: `.\venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`
4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Configure Environment Variables:
   - Duplicate `.env.example` and rename it to `.env`.
   - Open `.env` and paste your Gemini API key:
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     ```

## 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. (Optional) Configure Environment:
   - Create a `.env.local` file if you need to change the API URL (defaults to http://localhost:8000).

---

## 4. Verification
To ensure everything is installed correctly, you can run the test suite:
```bash
cd backend
# With venv activated
python -m pytest tests/test_comprehensive.py -v
```
All tests should pass.
