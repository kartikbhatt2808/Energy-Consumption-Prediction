
import math
from typing import List, Dict, Any

STATE_FACTORS = {
    'Andhra Pradesh': {'temp': 33, 'humidity': 70, 'tariff': 6.0, 'climate': 'hot-humid'},
    'Arunachal Pradesh': {'temp': 20, 'humidity': 75, 'tariff': 5.0, 'climate': 'pleasant'},
    'Assam': {'temp': 28, 'humidity': 80, 'tariff': 5.5, 'climate': 'humid'},
    'Bihar': {'temp': 31, 'humidity': 65, 'tariff': 6.0, 'climate': 'moderate'},
    'Chhattisgarh': {'temp': 32, 'humidity': 60, 'tariff': 5.8, 'climate': 'hot-dry'},
    'Goa': {'temp': 30, 'humidity': 75, 'tariff': 6.2, 'climate': 'humid'},
    'Gujarat': {'temp': 34, 'humidity': 60, 'tariff': 5.8, 'climate': 'hot-dry'},
    'Haryana': {'temp': 31, 'humidity': 62, 'tariff': 6.0, 'climate': 'moderate'},
    'Himachal Pradesh': {'temp': 18, 'humidity': 55, 'tariff': 5.2, 'climate': 'cold'},
    'Jharkhand': {'temp': 30, 'humidity': 65, 'tariff': 5.7, 'climate': 'moderate'},
    'Karnataka': {'temp': 28, 'humidity': 65, 'tariff': 6.8, 'climate': 'pleasant'},
    'Kerala': {'temp': 29, 'humidity': 80, 'tariff': 6.2, 'climate': 'humid'},
    'Madhya Pradesh': {'temp': 30, 'humidity': 55, 'tariff': 5.9, 'climate': 'moderate'},
    'Maharashtra': {'temp': 30, 'humidity': 70, 'tariff': 7.2, 'climate': 'moderate'},
    'Manipur': {'temp': 24, 'humidity': 75, 'tariff': 5.3, 'climate': 'pleasant'},
    'Meghalaya': {'temp': 22, 'humidity': 80, 'tariff': 5.1, 'climate': 'pleasant'},
    'Mizoram': {'temp': 23, 'humidity': 75, 'tariff': 5.2, 'climate': 'pleasant'},
    'Nagaland': {'temp': 24, 'humidity': 70, 'tariff': 5.2, 'climate': 'pleasant'},
    'Odisha': {'temp': 31, 'humidity': 75, 'tariff': 5.5, 'climate': 'humid'},
    'Punjab': {'temp': 30, 'humidity': 60, 'tariff': 5.8, 'climate': 'moderate'},
    'Rajasthan': {'temp': 36, 'humidity': 40, 'tariff': 6.0, 'climate': 'desert'},
    'Sikkim': {'temp': 18, 'humidity': 70, 'tariff': 5.0, 'climate': 'cold'},
    'Tamil Nadu': {'temp': 33, 'humidity': 75, 'tariff': 5.5, 'climate': 'hot-humid'},
    'Telangana': {'temp': 32, 'humidity': 65, 'tariff': 6.5, 'climate': 'hot-dry'},
    'Tripura': {'temp': 28, 'humidity': 80, 'tariff': 5.4, 'climate': 'humid'},
    'Uttar Pradesh': {'temp': 31, 'humidity': 68, 'tariff': 6.3, 'climate': 'moderate'},
    'Uttarakhand': {'temp': 19, 'humidity': 60, 'tariff': 5.3, 'climate': 'cold'},
    'West Bengal': {'temp': 30, 'humidity': 78, 'tariff': 7.0, 'climate': 'humid'},
    'Andaman and Nicobar Islands': {'temp': 29, 'humidity': 85, 'tariff': 7.0, 'climate': 'humid'},
    'Chandigarh': {'temp': 29, 'humidity': 55, 'tariff': 6.0, 'climate': 'moderate'},
    'Dadra and Nagar Haveli and Daman and Diu': {'temp': 32, 'humidity': 70, 'tariff': 5.8, 'climate': 'hot-humid'},
    'Delhi': {'temp': 32, 'humidity': 65, 'tariff': 6.5, 'climate': 'extreme'},
    'Jammu & Kashmir': {'temp': 18, 'humidity': 55, 'tariff': 5.0, 'climate': 'cold'},
    'Ladakh': {'temp': 10, 'humidity': 40, 'tariff': 5.5, 'climate': 'cold'},
    'Lakshadweep': {'temp': 30, 'humidity': 80, 'tariff': 6.5, 'climate': 'humid'},
    'Puducherry': {'temp': 31, 'humidity': 75, 'tariff': 5.6, 'climate': 'hot-humid'},
}


class HybridEnergyModel:
    """Python port of the frontend HybridEnergyModel (no external ML libs)."""

    def __init__(self) -> None:
        self.state_factors = STATE_FACTORS

    def _get_state(self, state: str) -> Dict[str, Any]:
        return self.state_factors.get(state, self.state_factors['Delhi'])

    def _seasonality_factor(self, month: int, state: str) -> float:
        state_data = self._get_state(state)
        seasonal_pattern = math.sin((month - 1) * math.pi / 6.0)

        climate = state_data['climate']
        if climate == 'cold':
            return 1.4 if month >= 10 or month <= 2 else 0.8
        elif climate in ('desert', 'hot-dry'):
            return 1.5 if 4 <= month <= 7 else 0.9
        else:
            return 1.0 + (seasonal_pattern * 0.3)

    def _prophet_like_component(self, avg_units: float, month: int, state: str) -> float:
        base_growth = 1.0 + 0.02 * (month - 1)
        seasonal = self._seasonality_factor(month, state)
        return avg_units * base_growth * seasonal

    def _xgboost_like_regression(
        self,
        avg_units: float,
        appliances: List[Dict[str, Any]],
        state: str,
    ) -> float:
        state_data = self._get_state(state)
        temp = state_data['temp']
        humidity = state_data['humidity']
        state_pop_factor = 1.05

        prediction = avg_units * 1.1
        appliance_kwh = 0.0
        for app in appliances:
            monthly_kwh = (app['watts'] * app['hours'] * 30.0) / 1000.0
            appliance_kwh += monthly_kwh
        prediction += appliance_kwh

        prediction *= 1.0 + (temp - 25.0) * 0.01
        prediction *= 1.0 + (humidity - 50.0) * 0.005
        prediction *= state_pop_factor

        return prediction

    def rule_based_appliances(
        self,
        appliances: List[Dict[str, Any]],
        state: str,
    ) -> Dict[str, float]:
        state_data = self._get_state(state)
        breakdown: Dict[str, float] = {
            'cooling': 0.0,
            'heating': 0.0,
            'kitchen': 0.0,
            'entertainment': 0.0,
            'lighting': 0.0,
            'electronics': 0.0,
            'miscellaneous': 0.0,
        }

        for app in appliances:
            monthly_kwh = (app['watts'] * app['hours'] * 30.0) / 1000.0
            adjusted = monthly_kwh

            cat = app.get('category', '')

            if cat == 'cooling':
                adjusted *= 1.2 if state_data['temp'] >= 30 else 0.9
                if state_data['climate'] in ('hot-humid', 'humid'):
                    adjusted *= 1.1

            if cat == 'heating':
                adjusted *= 1.3 if state_data['climate'] == 'cold' else 0.9

            if cat == 'kitchen' and state_data['humidity'] >= 70:
                adjusted *= 1.1

            if cat in breakdown:
                breakdown[cat] += adjusted
            else:
                breakdown['miscellaneous'] += adjusted

        return breakdown

    def generate_tips(self, state: str, appliance_breakdown: Dict[str, float]) -> List[str]:
        state_data = self._get_state(state)
        tips: List[str] = []

        climate = state_data['climate']
        if climate == 'cold':
            tips.append('🔥 Install thermal insulation to reduce heating costs by 20-30%')
            tips.append('🌡️ Use smart thermostats to optimize heating schedules')
            tips.append('🪟 Seal windows and doors to prevent heat loss')
        elif climate in ('desert', 'hot-dry'):
            tips.append('❄️ Set AC to 24-26°C to reduce cooling load by 25%')
            tips.append('🏠 Use reflective roofing to reduce indoor temperature')
            tips.append('🌳 Plant shade trees around your home')
        elif climate == 'humid':
            tips.append('💨 Use dehumidifiers efficiently to reduce AC runtime')
            tips.append('🪟 Ensure proper ventilation to reduce moisture')
            tips.append('☀️ Use natural ventilation during cooler hours')
        else:
            tips.append('⚡ Optimize appliance usage during off-peak hours')
            tips.append('📊 Track your monthly consumption to identify spikes')

        cooling = appliance_breakdown.get('cooling', 0.0)
        heating = appliance_breakdown.get('heating', 0.0)

        if cooling > heating:
            tips.append('❄️ Cooling appliances are your biggest consumers - consider upgrading to 5-star rated ACs')
        elif heating > cooling:
            tips.append('🔥 Heating appliances dominate - consider solar water heaters')

        tips.append('💡 Switch to LED bulbs - save up to 75% on lighting costs')
        tips.append('🔌 Unplug devices on standby mode - saves 5-10% monthly')

        return tips

    def calculate_shap(
        self,
        state: str,
        bill_history: List[float],
        appliances: List[Dict[str, Any]],
        avg_monthly: float,
    ) -> List[Dict[str, float]]:
        if not bill_history:
            avg_units = avg_monthly
        else:
            avg_units = sum(bill_history) / len(bill_history) if bill_history else avg_monthly

        base_value = max(avg_monthly, 1.0)

        return [
            {'feature': 'Historical Usage', 'impact': (avg_units / base_value) * 30.0},
            {'feature': 'Appliance Count', 'impact': (len(appliances) / 10.0) * 25.0},
            {'feature': 'Climate/Temp', 'impact': 20.0},
            {'feature': 'Seasonal Variation', 'impact': 15.0},
            {'feature': 'State Tariff', 'impact': 10.0},
        ]

    def predict(
        self,
        state: str,
        bill_history: List[float],
        appliances: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        if bill_history:
            avg_units = sum(bill_history) / len(bill_history)
        else:
            avg_units = 250.0

        state_data = self._get_state(state)
        tariff = state_data['tariff']

        predictions: List[Dict[str, Any]] = []
        total_units = 0.0
        total_cost = 0.0

        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        for idx, name in enumerate(month_names, start=1):
            prophet_component = self._prophet_like_component(avg_units, idx, state)
            xgb_component = self._xgboost_like_regression(avg_units, appliances, state)

            blended = (prophet_component * 0.4) + (xgb_component * 0.6)

            units = max(50.0, blended)
            cost = units * tariff

            total_units += units
            total_cost += cost

            predictions.append({
                'month': name,
                'units': round(units),
                'cost': round(cost),
            })

        appliance_breakdown = self.rule_based_appliances(appliances, state)
        avg_monthly = total_units / 12.0 if total_units else 0.0
        tips = self.generate_tips(state, appliance_breakdown)

        return {
            'predictions': predictions,
            'appliance_breakdown': appliance_breakdown,
            'total_annual': round(total_units),
            'total_cost': round(total_cost),
            'avg_monthly': round(avg_monthly),
            'tips': tips,
        }
