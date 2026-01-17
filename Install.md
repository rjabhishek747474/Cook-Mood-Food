# Installation Guide - DailyCook

## Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Git**
- **Docker** (optional, for containerized deployment)
- **Google Gemini API Key** (https://aistudio.google.com/)

---

## Option 1: Docker Installation (Recommended)

```bash
# Clone the repository
git clone https://github.com/rjabhishek747474/Cook-Mood-Food
cd Cook-Mood-Food

# Start all services
docker-compose up -d

# Create test users
docker-compose exec backend python -m scripts.seed_data

# Open http://localhost:3000
```

### Test Credentials
| Role | Email | Password |
|------|-------|----------|
| User | test@test.com | test123 |
| Admin | admin@dailycook.com | admin123 |

---

## Option 2: Manual Installation

### 1. Clone the Repository
```bash
git clone https://github.com/rjabhishek747474/Cook-Mood-Food
cd Cook-Mood-Food
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create .env file with:
# GEMINI_API_KEY=your_api_key_here
# SECRET_KEY=your_secret_key_here

# Create test users
python -m scripts.seed_data
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# (Optional) Create .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Verification
Run the test suite to ensure everything works:
```bash
cd backend
python -m pytest tests/test_comprehensive.py -v
python -m pytest tests/test_dashboard.py -v
```
All tests should pass.

---

## Environment Variables

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_jwt_secret_key
DATABASE_URL=sqlite+aiosqlite:///./dailycook.db
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
