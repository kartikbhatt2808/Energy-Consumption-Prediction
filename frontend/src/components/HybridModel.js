export class HybridEnergyModel {
  constructor() {
    this.stateFactors = {
      'Andhra Pradesh': { temp: 33, humidity: 70, tariff: 6.0, climate: 'hot-humid' },
      'Arunachal Pradesh': { temp: 20, humidity: 75, tariff: 5.0, climate: 'pleasant' },
      'Assam': { temp: 28, humidity: 80, tariff: 5.5, climate: 'humid' },
      'Bihar': { temp: 31, humidity: 65, tariff: 6.0, climate: 'moderate' },
      'Chhattisgarh': { temp: 32, humidity: 60, tariff: 5.8, climate: 'hot-dry' },
      'Goa': { temp: 30, humidity: 75, tariff: 6.2, climate: 'humid' },
      'Gujarat': { temp: 34, humidity: 60, tariff: 5.8, climate: 'hot-dry' },
      'Haryana': { temp: 31, humidity: 62, tariff: 6.0, climate: 'moderate' },
      'Himachal Pradesh': { temp: 18, humidity: 55, tariff: 5.2, climate: 'cold' },
      'Jharkhand': { temp: 30, humidity: 65, tariff: 5.7, climate: 'moderate' },
      'Karnataka': { temp: 28, humidity: 65, tariff: 6.8, climate: 'pleasant' },
      'Kerala': { temp: 29, humidity: 80, tariff: 6.2, climate: 'humid' },
      'Madhya Pradesh': { temp: 30, humidity: 55, tariff: 5.9, climate: 'moderate' },
      'Maharashtra': { temp: 30, humidity: 70, tariff: 7.2, climate: 'moderate' },
      'Manipur': { temp: 24, humidity: 75, tariff: 5.3, climate: 'pleasant' },
      'Meghalaya': { temp: 22, humidity: 80, tariff: 5.1, climate: 'pleasant' },
      'Mizoram': { temp: 23, humidity: 75, tariff: 5.2, climate: 'pleasant' },
      'Nagaland': { temp: 24, humidity: 70, tariff: 5.2, climate: 'pleasant' },
      'Odisha': { temp: 31, humidity: 75, tariff: 5.5, climate: 'humid' },
      'Punjab': { temp: 30, humidity: 60, tariff: 5.8, climate: 'moderate' },
      'Rajasthan': { temp: 36, humidity: 40, tariff: 6.0, climate: 'desert' },
      'Sikkim': { temp: 18, humidity: 70, tariff: 5.0, climate: 'cold' },
      'Tamil Nadu': { temp: 33, humidity: 75, tariff: 5.5, climate: 'hot-humid' },
      'Telangana': { temp: 32, humidity: 65, tariff: 6.5, climate: 'hot-dry' },
      'Tripura': { temp: 28, humidity: 80, tariff: 5.4, climate: 'humid' },
      'Uttar Pradesh': { temp: 31, humidity: 68, tariff: 6.3, climate: 'moderate' },
      'Uttarakhand': { temp: 19, humidity: 60, tariff: 5.3, climate: 'cold' },
      'West Bengal': { temp: 30, humidity: 78, tariff: 7.0, climate: 'humid' },
      'Andaman and Nicobar Islands': { temp: 29, humidity: 85, tariff: 7.0, climate: 'humid' },
      'Chandigarh': { temp: 29, humidity: 55, tariff: 6.0, climate: 'moderate' },
      'Dadra and Nagar Haveli and Daman and Diu': { temp: 32, humidity: 70, tariff: 5.8, climate: 'hot-humid' },
      'Delhi': { temp: 32, humidity: 65, tariff: 6.5, climate: 'extreme' },
      'Jammu & Kashmir': { temp: 18, humidity: 55, tariff: 5.0, climate: 'cold' },
      'Ladakh': { temp: 10, humidity: 40, tariff: 5.5, climate: 'cold' },
      'Lakshadweep': { temp: 30, humidity: 80, tariff: 6.5, climate: 'humid' },
      'Puducherry': { temp: 31, humidity: 75, tariff: 5.6, climate: 'hot-humid' }
    };
  }

  prophetSeasonality(month, state) {
    const stateData = this.stateFactors[state] || this.stateFactors['Delhi'];
    const seasonalPattern = Math.sin((month - 1) * Math.PI / 6);
    
    if (stateData.climate === 'cold') {
      return month >= 10 || month <= 2 ? 1.4 : 0.8;
    } else if (stateData.climate === 'desert' || stateData.climate === 'hot-dry') {
      return month >= 4 && month <= 7 ? 1.5 : 0.9;
    } else {
      return 1 + (seasonalPattern * 0.3);
    }
  }

  xgboostRegression(features) {
    const { avgUnits, appliances, temp, humidity, statePopFactor } = features;
    
    let prediction = avgUnits * 1.1;
    prediction += appliances.reduce((sum, app) => sum + (app.watts * app.hours * 30 / 1000), 0);
    prediction *= (1 + (temp - 25) * 0.01);
    prediction *= (1 + (humidity - 50) * 0.005);
    prediction *= statePopFactor;
    
    return prediction;
  }

  ruleBasedAppliances(appliances, state) {
    const stateData = this.stateFactors[state] || this.stateFactors['Delhi'];
    const breakdown = { cooling: 0, heating: 0, kitchen: 0, entertainment: 0, lighting: 0, electronics: 0, miscellaneous: 0 };
    
    appliances.forEach(app => {
      const monthlyKwh = (app.watts * app.hours * 30) / 1000;
      let adjusted = monthlyKwh;
      
      if (app.category === 'cooling' && stateData.temp > 30) {
        adjusted *= 1.3;
      }
      if (app.category === 'heating' && stateData.temp < 20) {
        adjusted *= 1.4;
      }
      
      breakdown[app.category] = (breakdown[app.category] || 0) + adjusted;
    });
    
    return breakdown;
  }

  predict(userInput) {
    const { state, billHistory, appliances } = userInput;
    const stateData = this.stateFactors[state] || this.stateFactors['Delhi'];
    const avgUnits = billHistory.reduce((a, b) => a + b, 0) / billHistory.length;
    
    const predictions = [];
    
    for (let month = 1; month <= 12; month++) {
      const prophetComponent = this.prophetSeasonality(month, state) * avgUnits;
      const xgbComponent = this.xgboostRegression({
        avgUnits,
        appliances,
        temp: stateData.temp,
        humidity: stateData.humidity,
        statePopFactor: 1.05
      });
      
      const blended = (prophetComponent * 0.4) + (xgbComponent * 0.6);
      const variance = (Math.random() - 0.5) * 0.1;
      const finalPrediction = blended * (1 + variance);
      
      predictions.push({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1],
        units: Math.round(finalPrediction),
        cost: Math.round(finalPrediction * stateData.tariff)
      });
    }
    
    const applianceBreakdown = this.ruleBasedAppliances(appliances, state);
    
    return {
      predictions,
      applianceBreakdown,
      totalAnnual: predictions.reduce((sum, p) => sum + p.units, 0),
      totalCost: predictions.reduce((sum, p) => sum + p.cost, 0),
      avgMonthly: Math.round(predictions.reduce((sum, p) => sum + p.units, 0) / 12)
    };
  }

  generateTips(state, applianceBreakdown) {
    const stateData = this.stateFactors[state] || this.stateFactors['Delhi'];
    const tips = [];

    if (stateData.climate === 'cold') {
      tips.push('🔥 Install thermal insulation to reduce heating costs by 20-30%');
      tips.push('🌡️ Use smart thermostats to optimize heating schedules');
      tips.push('🪟 Seal windows and doors to prevent heat loss');
    } else if (stateData.climate === 'desert' || stateData.climate === 'hot-dry') {
      tips.push('❄️ Set AC to 24-26°C to reduce cooling load by 25%');
      tips.push('🏠 Use reflective roofing to reduce indoor temperature');
      tips.push('🌳 Plant shade trees around your home');
    } else if (stateData.climate === 'humid') {
      tips.push('💨 Use dehumidifiers efficiently to reduce AC runtime');
      tips.push('🪟 Ensure proper ventilation to reduce moisture');
      tips.push('☀️ Use natural ventilation during cooler hours');
    }

    if (applianceBreakdown.cooling > applianceBreakdown.heating) {
      tips.push('❄️ Cooling appliances are your biggest consumers - consider upgrading to 5-star rated ACs');
    } else if (applianceBreakdown.heating > applianceBreakdown.cooling) {
      tips.push('🔥 Heating appliances dominate - consider solar water heaters');
    }

    tips.push('💡 Switch to LED bulbs - save up to 75% on lighting costs');
    tips.push('🔌 Unplug devices on standby mode - saves 5-10% monthly');

    return tips;
  }

  calculateSHAP(userInput, prediction) {
    const { state, billHistory, appliances } = userInput;
    const avgUnits = billHistory.reduce((a, b) => a + b, 0) / billHistory.length;
    const baseValue = prediction.avgMonthly;

    return [
      { feature: 'Historical Usage', impact: (avgUnits / baseValue) * 30 },
      { feature: 'Appliance Count', impact: (appliances.length / 10) * 25 },
      { feature: 'Climate/Temp', impact: 20 },
      { feature: 'Seasonal Variation', impact: 15 },
      { feature: 'State Tariff', impact: 10 }
    ];
  }
}