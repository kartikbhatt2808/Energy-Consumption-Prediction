# Energy Prediction System - Backend

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run server:
```bash
uvicorn app.main:app --reload
```

API will be available at: http://localhost:8000
API documentation: http://localhost:8000/docs

## API Endpoints

- POST `/api/v1/predict` - Get energy predictions
- POST `/api/v1/shap` - Get SHAP values
- GET `/api/v1/states` - List all states
- GET `/api/v1/states/{state}` - Get state details
- GET `/api/v1/appliances` - List all appliances