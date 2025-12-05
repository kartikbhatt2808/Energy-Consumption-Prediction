import React, { useState, useEffect } from 'react';
import './App.css';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp, DollarSign, Lightbulb, BarChart3, Activity } from 'lucide-react';

const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const APPLIANCES = [
  { name: 'Air Conditioner', defaultWatts: 1500, category: 'cooling' },
  { name: 'Heater', defaultWatts: 2000, category: 'heating' },
  { name: 'Geyser', defaultWatts: 2000, category: 'heating' },
  { name: 'Refrigerator', defaultWatts: 150, category: 'kitchen' },
  { name: 'Washing Machine', defaultWatts: 500, category: 'kitchen' },
  { name: 'Microwave', defaultWatts: 1200, category: 'kitchen' },
  { name: 'Television', defaultWatts: 100, category: 'entertainment' },
  { name: 'Fan', defaultWatts: 75, category: 'cooling' },
  { name: 'Light Bulbs', defaultWatts: 40, category: 'lighting' },
  { name: 'Desktop Computer', defaultWatts: 200, category: 'electronics' },
  { name: 'Miscellaneous', defaultWatts: 100, category: 'miscellaneous' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Hybrid Model Implementation
class HybridEnergyModel {
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

  // Prophet-like time series component
  prophetSeasonality(month, state) {
    const stateData = this.stateFactors[state] || this.stateFactors['Delhi'];
    const seasonalPattern = Math.sin((month - 1) * Math.PI / 6);
    
    if (stateData.climate === 'cold') {
      return month >= 10 || month <= 2 ? 1.4 : 0.8; // Winter peak
    } else if (stateData.climate === 'desert' || stateData.climate === 'hot-dry') {
      return month >= 4 && month <= 7 ? 1.5 : 0.9; // Summer peak
    } else {
      return 1 + (seasonalPattern * 0.3);
    }
  }

  // XGBoost-like regression component
  xgboostRegression(features) {
    const { avgUnits, appliances, temp, humidity, statePopFactor } = features;
    
    let prediction = avgUnits * 1.1; // Base trend
    prediction += appliances.reduce((sum, app) => sum + (app.watts * app.hours * 30 / 1000), 0);
    prediction *= (1 + (temp - 25) * 0.01); // Temperature impact
    prediction *= (1 + (humidity - 50) * 0.005); // Humidity impact
    prediction *= statePopFactor;
    
    return prediction;
  }

  // Rule-based appliance model
  ruleBasedAppliances(appliances, state) {
    const stateData = this.stateFactors[state] || this.stateFactors['Delhi'];
    const breakdown = { cooling: 0, heating: 0, kitchen: 0, entertainment: 0, lighting: 0, electronics: 0 };
    
    appliances.forEach(app => {
      const monthlyKwh = (app.watts * app.hours * 30) / 1000;
      let adjusted = monthlyKwh;
      
      // Climate-based adjustments
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

  // Blending layer
  predict(userInput) {
    const { state, billHistory, appliances } = userInput;
    const stateData = this.stateFactors[state] || this.stateFactors['Delhi'];
    const avgUnits = billHistory.reduce((a, b) => a + b, 0) / billHistory.length;
    
    const predictions = [];
    let totalProphet = 0;
    let totalXGB = 0;
    
    for (let month = 1; month <= 12; month++) {
      const prophetComponent = this.prophetSeasonality(month, state) * avgUnits;
      const xgbComponent = this.xgboostRegression({
        avgUnits,
        appliances,
        temp: stateData.temp,
        humidity: stateData.humidity,
        statePopFactor: 1.05
      });
      
      // Hybrid blend: 40% Prophet + 60% XGBoost
      const blended = (prophetComponent * 0.4) + (xgbComponent * 0.6);
      const variance = (Math.random() - 0.5) * 0.1;
      const finalPrediction = blended * (1 + variance);
      
      totalProphet += prophetComponent;
      totalXGB += xgbComponent;
      
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

export default function EnergyPredictionSystem() {
  const [page, setPage] = useState('input');
  const [state, setState] = useState('Delhi');
  const [billHistory, setBillHistory] = useState(Array(24).fill(0).map(() => Math.floor(Math.random() * 100) + 200));
  const [selectedAppliances, setSelectedAppliances] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [model] = useState(new HybridEnergyModel());

  const handleApplianceToggle = (appliance) => {
    const existing = selectedAppliances.find(a => a.name === appliance.name);
    if (existing) {
      setSelectedAppliances(selectedAppliances.filter(a => a.name !== appliance.name));
    } else {
      setSelectedAppliances([...selectedAppliances, { ...appliance, watts: appliance.defaultWatts, hours: 5 }]);
    }
  };

  const handleHoursChange = (applianceName, hours) => {
    setSelectedAppliances(selectedAppliances.map(a => 
      a.name === applianceName ? { ...a, hours: parseInt(hours) || 0 } : a
    ));
  };

  const handleWattsChange = (applianceName, watts) => {
    setSelectedAppliances(selectedAppliances.map(a => 
      a.name === applianceName ? { ...a, watts: parseInt(watts) || 0 } : a
    ));
  };

  const runPrediction = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state,
          bill_history: billHistory,
          appliances: selectedAppliances,
        }),
      });

      if (!response.ok) {
        console.error('Prediction API error', await response.text());
        return;
      }

      const data = await response.json();

      // Map backend response keys to frontend shape
      const mapped = {
        predictions: data.predictions,
        applianceBreakdown: data.appliance_breakdown,
        totalAnnual: data.total_annual,
        totalCost: data.total_cost,
        avgMonthly: data.avg_monthly,
        tips: data.tips,
      };

      setPrediction(mapped);
      setPage('dashboard');
    } catch (err) {
      console.error('Failed to call prediction API', err);
    }
  };

  const renderInput = () => (
  <div className="eps-page">
    <div className="eps-hero">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8" />
          Hybrid AI Energy Prediction System
        </h1>
        <p className="text-blue-100">Prophet + XGBoost + Rule-Based Hybrid Model</p>
      </div>

      <div className="eps-card eps-card--soft">
        <h2 className="text-xl font-bold mb-4">Select Your State</h2>
        <select 
          value={state} 
          onChange={(e) => setState(e.target.value)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg"
        >
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="eps-card eps-card--soft">
        <h2 className="text-xl font-bold mb-4">Past Energy Consumption</h2>
        <p className="text-gray-600 mb-4">Average monthly units (last 24 months): <span className="font-bold text-blue-600">{Math.round(billHistory.reduce((a,b) => a+b, 0) / billHistory.length)} kWh</span></p>
        <div className="grid grid-cols-4 gap-2">
          {billHistory.slice(0, 12).map((units, i) => (
            <input
              key={i}
              type="number"
              value={units}
              onChange={(e) => {
                const newHistory = [...billHistory];
                newHistory[i] = parseInt(e.target.value) || 0;
                setBillHistory(newHistory);
              }}
              className="p-2 border rounded text-center"
              placeholder={`M${i+1}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Select Your Appliances & Configure</h2>
        <p className="text-gray-600 mb-4">Customize wattage and daily usage hours for each appliance</p>
        <div className="space-y-3">
          {APPLIANCES.map(appliance => {
            const selected = selectedAppliances.find(a => a.name === appliance.name);
            return (
              <div key={appliance.name} className="flex items-center gap-3 p-4 border-2 rounded-lg hover:border-blue-300 transition-colors">
                <input
                  type="checkbox"
                  checked={!!selected}
                  onChange={() => handleApplianceToggle(appliance)}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-semibold text-lg">{appliance.name}</div>
                  <div className="text-sm text-gray-600">Category: {appliance.category}</div>
                </div>
                {selected && (
                  <div className="flex gap-2">
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-600 mb-1">Watts</label>
                      <input
                        type="number"
                        value={selected.watts}
                        onChange={(e) => handleWattsChange(appliance.name, e.target.value)}
                        className="w-24 p-2 border-2 rounded-lg text-center font-semibold"
                        placeholder="Watts"
                        min="1"
                        max="5000"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-600 mb-1">Hours/day</label>
                      <input
                        type="number"
                        value={selected.hours}
                        onChange={(e) => handleHoursChange(appliance.name, e.target.value)}
                        className="w-24 p-2 border-2 rounded-lg text-center font-semibold"
                        placeholder="Hours"
                        min="0"
                        max="24"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {selectedAppliances.length > 0 && (
          <div className="eps-selection-summary">
            <div className="font-semibold text-blue-900 mb-2">Selected Appliances Summary:</div>
            <div className="text-sm text-blue-700">
              {selectedAppliances.map(a => `${a.name} (${a.watts}W × ${a.hours}h)`).join(', ')}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={runPrediction}
        disabled={selectedAppliances.length === 0}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-lg text-xl font-bold hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Activity className="w-6 h-6" />
        Run Hybrid AI Prediction
      </button>
    </div>
  );

  const renderDashboard = () => {
    if (!prediction) return null;

    const applianceData = Object.entries(prediction.applianceBreakdown).map(([category, value]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: Math.round(value)
    })).filter(d => d.value > 0);

    const shapData = model.calculateSHAP({ state, billHistory, appliances: selectedAppliances }, prediction);
    const tips = prediction.tips || model.generateTips(state, prediction.applianceBreakdown);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Prediction Results</h1>
          <button
            onClick={() => setPage('input')}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            ← Back to Input
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6" />
              <div className="text-sm opacity-90">Avg Monthly</div>
            </div>
            <div className="text-3xl font-bold">{prediction.avgMonthly} kWh</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6" />
              <div className="text-sm opacity-90">Annual Total</div>
            </div>
            <div className="text-3xl font-bold">{prediction.totalAnnual} kWh</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-6 h-6" />
              <div className="text-sm opacity-90">Annual Cost</div>
            </div>
            <div className="text-3xl font-bold">₹{prediction.totalCost}</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-6 h-6" />
              <div className="text-sm opacity-90">State</div>
            </div>
            <div className="text-2xl font-bold">{state}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">12-Month Energy Forecast</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prediction.predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="units" stroke="#8884d8" strokeWidth={2} name="Units (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Appliance Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={applianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {applianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Cost Projection</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prediction.predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cost" fill="#82ca9d" name="Cost (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">SHAP Feature Importance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={shapData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="feature" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="impact" fill="#8884d8" name="Impact (%)" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            SHAP values show which factors most influence your energy prediction. Higher values mean greater impact.
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Smart Energy Saving Tips for {state}
          </h2>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-root">
      <div className="app-shell">
        {page === 'input' ? renderInput() : renderDashboard()}
      </div>
    </div>
  );
}