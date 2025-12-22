
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import * as XLSX from 'xlsx';

const GovtScheme = () => {
  const navigate = useNavigate();
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [age, setAge] = useState('');
  const [state, setState] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [usingExcelData, setUsingExcelData] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [filteredStates, setFilteredStates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredConditions, setFilteredConditions] = useState([]);

  // Indian states list
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
    'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  useEffect(() => {
    loadExcelData();
  }, []);

  useEffect(() => {
    // Filter conditions based on search query
    if (searchQuery.trim() === '') {
      setFilteredConditions(medicalConditions);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = medicalConditions.filter(item =>
        item.condition.toLowerCase().includes(query)
      );
      setFilteredConditions(filtered);
    }
  }, [searchQuery, medicalConditions]);

  useEffect(() => {
    // Filter states based on search query
    const query = (state || stateSearchQuery).toLowerCase().trim();
    if (query === '') {
      setFilteredStates(indianStates);
    } else {
      const filtered = indianStates.filter(stateName =>
        stateName.toLowerCase().includes(query)
      );
      setFilteredStates(filtered);
    }
  }, [stateSearchQuery, state]);

  const loadExcelData = async () => {
    try {
      console.log('Attempting to load HBP.xlsx from public folder...');
      const response = await fetch('/HBP.xlsx');
      
      if (!response.ok) {
        console.error('Failed to fetch Excel file. Status:', response.status);
        loadSampleData();
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('Excel file loaded, size:', arrayBuffer.byteLength, 'bytes');
      
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      console.log('Workbook sheets:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Raw Excel data (first 3 rows):', data.slice(0, 3));
      console.log('Total rows:', data.length);
      
      // Get column names from first row to detect the structure
      const firstRow = data[0];
      const keys = Object.keys(firstRow);
      console.log('Detected column names:', keys);
      
      // Find condition and price columns (case-insensitive)
      const conditionKey = keys.find(k => 
        k.toLowerCase().includes('condition') || 
        k.toLowerCase().includes('medical') ||
        k.toLowerCase().includes('disease') ||
        k.toLowerCase().includes('treatment')
      ) || keys[0];
      
      const priceKey = keys.find(k => 
        k.toLowerCase().includes('price') || 
        k.toLowerCase().includes('avg') ||
        k.toLowerCase().includes('amount') ||
        k.toLowerCase().includes('cost')
      ) || keys[1];
      
      console.log('Using condition column:', conditionKey);
      console.log('Using price column:', priceKey);
      
      // Try multiple column name variations
      const conditions = data.map((row, index) => {
        // Try different variations of column names
        const condition = 
          row['Medical Condition'] || 
          row['Medical condition'] || 
          row['Medical condition'] || 
          row['MEDICAL CONDITION'] ||
          row['Condition'] ||
          row['condition'] ||
          (conditionKey ? row[conditionKey] : null) ||
          keys[0] ? row[keys[0]] : null;
        
        // Try different variations of price column
        const priceStr = 
          row['Avg price'] || 
          row['avg price'] || 
          row['Avg Price'] || 
          row['AVG PRICE'] ||
          row['Average Price'] ||
          row['average price'] ||
          row['Price'] ||
          row['price'] ||
          (priceKey ? row[priceKey] : null) ||
          keys[1] ? row[keys[1]] : null;
        
        // Convert price to number (handle string numbers, remove currency symbols, etc.)
        let avgPrice = null;
        if (priceStr !== null && priceStr !== undefined && priceStr !== '') {
          const priceNum = typeof priceStr === 'string' 
            ? parseFloat(priceStr.toString().replace(/[₹,\s]/g, '')) 
            : parseFloat(priceStr);
          avgPrice = isNaN(priceNum) ? null : priceNum;
        }
        
        return {
          condition: condition,
          avgPrice: avgPrice
        };
      }).filter(item => item.condition && item.avgPrice !== null && !isNaN(item.avgPrice) && item.avgPrice > 0);
      
      console.log('Processed conditions (first 3):', conditions.slice(0, 3));
      console.log('Total valid conditions:', conditions.length);
      
      if (conditions.length === 0) {
        console.warn('No valid conditions found in Excel file. Using sample data.');
        loadSampleData();
        return;
      }
      
      setMedicalConditions(conditions);
      setUsingExcelData(true);
      setLoading(false);
      console.log('Successfully loaded', conditions.length, 'medical conditions from Excel file');
    } catch (err) {
      console.error('Error loading Excel file:', err);
      console.error('Error details:', err.message, err.stack);
      // Fallback to sample data
      loadSampleData();
    }
  };

  const loadSampleData = () => {
    console.warn('Using sample data. Please place HBP.xlsx in the client/public/ folder.');
    setUsingExcelData(false);
    // Sample data structure - replace with actual Excel data
    const sampleData = [
      { condition: 'Heart Bypass Surgery', avgPrice: 150000 },
      { condition: 'Knee Replacement', avgPrice: 120000 },
      { condition: 'Hip Replacement', avgPrice: 130000 },
      { condition: 'Cataract Surgery', avgPrice: 15000 },
      { condition: 'Angioplasty', avgPrice: 80000 },
      { condition: 'Kidney Transplant', avgPrice: 1100000 },
      { condition: 'Liver Transplant', avgPrice: 1200000 },
      { condition: 'Cancer Treatment (Chemotherapy)', avgPrice: 200000 },
      { condition: 'Spine Surgery', avgPrice: 250000 },
      { condition: 'Brain Tumor Surgery', avgPrice: 300000 },
      { condition: 'Diabetes Treatment', avgPrice: 50000 },
      { condition: 'Dialysis', avgPrice: 3000 },
      { condition: 'Gallbladder Surgery', avgPrice: 40000 },
      { condition: 'Hernia Repair', avgPrice: 35000 },
      { condition: 'Appendectomy', avgPrice: 30000 }
    ];
    setMedicalConditions(sampleData);
    setLoading(false);
  };

  const handleSearch = () => {
    setError('');
    setResult(null);

    // Validation
    if (!selectedCondition) {
      setError('Please select a medical condition');
      return;
    }

    if (!age || age < 0 || age > 120) {
      setError('Please enter a valid age (0-120)');
      return;
    }

    const ageNum = parseInt(age);

    // Find the condition data
    const conditionData = medicalConditions.find(
      item => item.condition.toLowerCase() === selectedCondition.toLowerCase()
    );

    if (!conditionData) {
      setError('Medical condition not found in database');
      return;
    }

    if (ageNum >= 70) {
      // PM-JAN scheme applies to all users 70+
      setResult({
        condition: conditionData.condition,
        avgPrice: conditionData.avgPrice,
        scheme: 'PM-JAN (Pradhan Mantri Jan Arogya Yojana)',
        eligibility: 'You are eligible for PM-JAN scheme (Age 70+)',
        coverage: 'Full coverage under PM-JAN scheme',
        stateRequired: false,
        age: ageNum
      });
    } else {
      // Age < 70 - still show PM-JAN for now, but mention state schemes coming
      if (!state) {
        setError('Please select your state');
        return;
      }
      setResult({
        condition: conditionData.condition,
        avgPrice: conditionData.avgPrice,
        scheme: 'PM-JAN (Pradhan Mantri Jan Arogya Yojana)',
        eligibility: `You are eligible for PM-JAN scheme. State-specific schemes for ${state} will be available soon.`,
        coverage: 'Full coverage under PM-JAN scheme',
        stateRequired: true,
        state: state,
        age: ageNum,
        note: `State-specific schemes for ${state} are under development and will be available soon.`
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#1a1a1a]" style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}
      </style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(240,255,240,1)_0,_rgba(230,250,240,0.5)_100%)]" />

      <div className="relative">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a1a1a] mb-3">
              Government <span className="text-[#009b7d]">Health Schemes</span>
            </h1>
            <p className="text-base text-[#2a2a2a] font-medium">
              Check your eligibility and coverage amount for government-funded medical treatments
            </p>
            {!loading && !usingExcelData && (
              <div className="mt-4 rounded-xl bg-amber-50 border-2 border-amber-200 p-3 max-w-2xl mx-auto">
                <p className="text-sm font-semibold text-amber-800">
                  ⚠️ Using sample data. To load your Excel file, place <strong>HBP.xlsx</strong> in the <strong>client/public/</strong> folder and refresh the page.
                </p>
              </div>
            )}
            {!loading && usingExcelData && (
              <div className="mt-4 rounded-xl bg-green-50 border-2 border-green-200 p-3 max-w-2xl mx-auto">
                <p className="text-sm font-semibold text-green-800">
                  ✓ Successfully loaded {medicalConditions.length} medical conditions from HBP.xlsx
                </p>
              </div>
            )}
          </div>

          {/* Main Form Card */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 mb-8">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#009b7d] border-t-transparent"></div>
                <p className="mt-4 text-[#009b7d] font-semibold">Loading medical conditions...</p>
              </div>
            ) : (
              <div className="space-y-6">

                 <div className="relative">
                   <label className="block text-sm font-bold text-[#009b7d] mb-2 uppercase tracking-wide">
                     🩺 Medical Condition
                   </label>
              <div className="relative">
                 <input type="text"
                  value={selectedCondition}
                  onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCondition(value);
                  setSearchQuery(value);
                  setShowDropdown(true);
                  }}
                    onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  placeholder="Search or type medical condition..."
  className="w-full rounded-xl border-2 border-[#009b7d]/30 bg-white px-4 py-3 text-sm font-semibold text-[#009b7d] focus:border-[#009b7d] focus:outline-none focus:ring-2 focus:ring-[#009b7d]/20"
/>

                     {selectedCondition && (
                       <button
                         type="button"
                         onMouseDown={() => {
                           setSearchQuery('');
                           setSelectedCondition('');
                           setShowDropdown(false);
                         }}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-[#009b7d] hover:text-[#007a63] transition-colors"
                       >
                         ✕
                       </button>
                     )}
                     
                     {/* Dropdown Menu */}
                     {showDropdown && filteredConditions.length > 0 && (
                       <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-[#009b7d]/30 shadow-[0_8px_32px_rgba(0,155,125,0.15)] max-h-64 overflow-y-auto">
                         {filteredConditions.map((item, index) => (
                           <button
                             key={index}
                             type="button"
                             onMouseDown={() => {
                               setSelectedCondition(item.condition);
                               setSearchQuery(item.condition);
                               setShowDropdown(false);
                             }}
                             className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-[#009b7d]/10 ${
                               selectedCondition === item.condition
                                 ? 'bg-[#009b7d]/20 text-[#009b7d] font-semibold'
                                 : 'text-[#1a1a1a] hover:text-[#009b7d]'
                             } ${index !== filteredConditions.length - 1 ? 'border-b border-[#009b7d]/10' : ''}`}
                           >
                             <span>{item.condition}</span>
                           </button>
                         ))}
                       </div>
                     )}
                     
                     {showDropdown && filteredConditions.length === 0 && selectedCondition.trim() !== '' && (
                       <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-[#009b7d]/30 shadow-[0_8px_32px_rgba(0,155,125,0.15)] p-4">
                         <p className="text-sm text-[#2a2a2a] font-medium text-center">
                           No medical conditions found matching "{selectedCondition}"
                         </p>
                       </div>
                     )}
                   </div>
                   
                   {/* Selected Condition Display */}
                   {selectedCondition && (
                     <div className="mt-2 rounded-xl bg-[#009b7d]/10 border border-[#009b7d]/30 p-3">
                       <p className="text-xs font-bold text-[#009b7d] uppercase mb-1">Selected Condition</p>
                       <p className="text-sm font-semibold text-[#1a1a1a]">{selectedCondition}</p>
                       {medicalConditions.find(c => c.condition === selectedCondition) && (
                         <p className="text-xs text-[#009b7d] font-medium mt-1">
                           Avg. Price: ₹{medicalConditions.find(c => c.condition === selectedCondition).avgPrice.toLocaleString('en-IN')}
                         </p>
                       )}
                     </div>
                   )}
                 </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-bold text-[#009b7d] mb-2 uppercase tracking-wide">
                    👤 Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    min="0"
                    max="120"
                    className="w-full rounded-xl border-2 border-[#009b7d]/30 bg-white px-4 py-3 text-sm font-semibold text-[#009b7d] focus:border-[#009b7d] focus:outline-none focus:ring-2 focus:ring-[#009b7d]/20"
                  />
                </div>

                {/* State - Only show if age < 70 - Searchable Dropdown */}
                {age && parseInt(age) < 70 && (
                  <div className="relative">
                    <label className="block text-sm font-bold text-[#009b7d] mb-2 uppercase tracking-wide">
                      🗺️ State
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => {
                          const value = e.target.value;
                          setState(value);
                          setStateSearchQuery(value);
                          setShowStateDropdown(true);
                        }}
                        onFocus={() => setShowStateDropdown(true)}
                        onBlur={() => {
                          setTimeout(() => setShowStateDropdown(false), 200);
                        }}
                        placeholder="Search or type state name..."
                        className="w-full rounded-xl border-2 border-[#009b7d]/30 bg-white px-4 py-3 text-sm font-semibold text-[#009b7d] focus:border-[#009b7d] focus:outline-none focus:ring-2 focus:ring-[#009b7d]/20"
                      />
                      {state && (
                        <button
                          type="button"
                          onMouseDown={() => {
                            setStateSearchQuery('');
                            setState('');
                            setShowStateDropdown(false);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#009b7d] hover:text-[#007a63] transition-colors"
                        >
                          ✕
                        </button>
                      )}
                      
                      {/* State Dropdown Menu */}
                      {showStateDropdown && filteredStates.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-[#009b7d]/30 shadow-[0_8px_32px_rgba(0,155,125,0.15)] max-h-64 overflow-y-auto">
                          {filteredStates.map((stateName, index) => (
                            <button
                              key={stateName}
                              type="button"
                              onMouseDown={() => {
                                setState(stateName);
                                setStateSearchQuery(stateName);
                                setShowStateDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-[#009b7d]/10 ${
                                state === stateName
                                  ? 'bg-[#009b7d]/20 text-[#009b7d] font-semibold'
                                  : 'text-[#1a1a1a] hover:text-[#009b7d]'
                              } ${index !== filteredStates.length - 1 ? 'border-b border-[#009b7d]/10' : ''}`}
                            >
                              <span>{stateName}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {showStateDropdown && filteredStates.length === 0 && state.trim() !== '' && (
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-[#009b7d]/30 shadow-[0_8px_32px_rgba(0,155,125,0.15)] p-4">
                          <p className="text-sm text-[#2a2a2a] font-medium text-center">
                            No states found matching "{state}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Selected State Display */}
                    {state && (
                      <div className="mt-2 rounded-xl bg-[#009b7d]/10 border border-[#009b7d]/30 p-3">
                        <p className="text-xs font-bold text-[#009b7d] uppercase mb-1">Selected State</p>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{state}</p>
                      </div>
                    )}
                    
                    <p className="mt-2 text-xs text-[#2a2a2a] font-medium">
                      State-specific schemes are under development. Currently showing PM-JAN scheme coverage.
                    </p>
                  </div>
                )}

                {/* Age 70+ Info */}
                {age && parseInt(age) >= 70 && (
                  <div className="rounded-xl bg-[#009b7d]/10 border-2 border-[#009b7d]/30 p-4">
                    <p className="text-sm font-bold text-[#009b7d]">
                      ✓ You are 70+ years old. PM-JAN scheme applies to all states. No state selection needed.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
                    <p className="text-sm font-semibold text-red-600">{error}</p>
                  </div>
                )}

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="w-full rounded-xl bg-gradient-to-br from-[#00b894] to-[#009b7d] px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009b7d]"
                >
                  Check Eligibility & Coverage
                </button>
              </div>
            )}
          </div>

          {/* Results Card */}
          {result && (
            <div className="rounded-3xl bg-white/60 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold text-[#009b7d] mb-2">Coverage Details</h2>
                  <p className="text-sm text-[#2a2a2a] font-medium">{result.eligibility}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Medical Condition */}
                  <div className="rounded-xl bg-[#009b7d]/10 p-6">
                    <p className="text-xs font-bold text-[#009b7d] uppercase mb-2">Medical Condition</p>
                    <p className="text-lg font-extrabold text-[#1a1a1a]">{result.condition}</p>
                  </div>

                  {/* Average Price */}
                  <div className="rounded-xl bg-[#009b7d]/10 p-6">
                    <p className="text-xs font-bold text-[#009b7d] uppercase mb-2">Average Price</p>
                    <p className="text-lg font-extrabold text-[#1a1a1a]">
                     {age<=70? result.avgPrice.toLocaleString('en-IN'):'FREE under PM-JAN'}
                    </p>
                  </div>

                  {/* Scheme */}
                  <div className="rounded-xl bg-[#009b7d]/10 p-6">
                    <p className="text-xs font-bold text-[#009b7d] uppercase mb-2">Scheme</p>
                    <p className="text-lg font-extrabold text-[#1a1a1a]">{result.scheme}</p>
                  </div>

                  {/* Coverage */}
                  <div className="rounded-xl bg-[#009b7d]/10 p-6">
                    <p className="text-xs font-bold text-[#009b7d] uppercase mb-2">Coverage</p>
                    <p className="text-lg font-extrabold text-[#1a1a1a]">{result.coverage}</p>
                  </div>
                </div>

                {/* Age Info */}
                <div className="rounded-xl bg-white/80 p-4 border border-[#009b7d]/20">
                  <p className="text-sm font-semibold text-[#2a2a2a]">
                    Age: <span className="text-[#009b7d]">{result.age} years</span>
                  </p>
                  {result.state && (
                    <p className="text-sm font-semibold text-[#2a2a2a] mt-1">
                      State: <span className="text-[#009b7d]">{result.state}</span>
                    </p>
                  )}
                </div>

                {/* Note for age < 70 */}
                {result.note && (
                  <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4">
                    <p className="text-sm font-semibold text-amber-800">{result.note}</p>
                  </div>
                )}

                {/* PM-JAN Info */}
                <div className="rounded-xl bg-[#009b7d]/5 border-2 border-[#009b7d]/20 p-4">
                  <p className="text-xs font-bold text-[#009b7d] uppercase mb-2">About PM-JAN</p>
                  <p className="text-xs text-[#2a2a2a] font-medium">
                    Pradhan Mantri Jan Arogya Yojana (PM-JAN) provides health coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 rounded-3xl bg-white/60 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60">
            <h3 className="text-lg font-bold text-[#009b7d] mb-3">How it works</h3>
            <ul className="space-y-2 text-sm text-[#2a2a2a] font-medium">
              <li className="flex items-start gap-2">
                <span className="text-[#009b7d] font-bold">1.</span>
                <span>Select your medical condition from the list</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#009b7d] font-bold">2.</span>
                <span>Enter your age</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#009b7d] font-bold">3.</span>
                <span>If you're under 70, select your state (state schemes coming soon)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#009b7d] font-bold">4.</span>
                <span>If you're 70+, PM-JAN scheme applies automatically to all states</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#009b7d] font-bold">5.</span>
                <span>View the average price covered by the government scheme</span>
              </li>
            </ul>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-[#009b7d]/40 bg-[#009b7d] backdrop-blur py-8 mt-10 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-lg font-extrabold text-white">Hospice</h3>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#e0f5ed] font-bold">
              Government Health Scheme Portal
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default GovtScheme;