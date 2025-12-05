from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.hybrid_model import STATE_FACTORS

router = APIRouter()

STATES_DATA: Dict[str, Dict[str, Any]] = STATE_FACTORS


@router.get("/states")
async def get_states() -> List[str]:
    """Return list of all supported states and union territories."""
    return sorted(STATES_DATA.keys())


@router.get("/states/{state}")
async def get_state_details(state: str):
    """Get climate and tariff data for a specific state."""
    if state not in STATES_DATA:
        raise HTTPException(status_code=404, detail="State not found")
    return STATES_DATA[state]


@router.get("/appliances")
async def get_appliances():
    """Get list of all supported appliances."""
    return [
        {'name': 'Air Conditioner', 'defaultWatts': 1500, 'category': 'cooling'},
        {'name': 'Heater', 'defaultWatts': 2000, 'category': 'heating'},
        {'name': 'Geyser', 'defaultWatts': 2000, 'category': 'heating'},
        {'name': 'Refrigerator', 'defaultWatts': 150, 'category': 'kitchen'},
        {'name': 'Washing Machine', 'defaultWatts': 500, 'category': 'kitchen'},
        {'name': 'Microwave', 'defaultWatts': 1200, 'category': 'kitchen'},
        {'name': 'Television', 'defaultWatts': 100, 'category': 'entertainment'},
        {'name': 'Fan', 'defaultWatts': 75, 'category': 'cooling'},
        {'name': 'Light Bulbs', 'defaultWatts': 40, 'category': 'lighting'},
        {'name': 'Desktop Computer', 'defaultWatts': 200, 'category': 'electronics'},
        {'name': 'Miscellaneous', 'defaultWatts': 100, 'category': 'miscellaneous'},
    ]
