# Hybrid AI Energy Prediction System

Complete system for predicting state-wise energy consumption using hybrid AI models.

## 🚀 Quick Start

### Frontend Only (Simplest)
```bash
cd frontend
npm install
npm start
```

### Full Stack
```bash
# Terminal 1 - Frontend
cd frontend
npm install
npm start

# Terminal 2 - Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Docker (Production)
```bash
docker-compose up --build
```

## 📚 Documentation

- Frontend: See `frontend/README.md`
- Backend: See `backend/README.md`

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Recharts
- Lucide Icons

**Backend:**
- FastAPI
- Prophet
- XGBoost
- SHAP

**Database:**
- PostgreSQL

## 📄 License

MIT License