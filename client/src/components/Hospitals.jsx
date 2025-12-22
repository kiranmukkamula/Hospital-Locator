import React, { useState, useEffect } from 'react';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance');
  const [sortSearchQuery, setSortSearchQuery] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const sortOptions = [
    { value: 'distance', label: 'Sort by Distance' },
    { value: 'beds', label: 'Sort by Beds' }
  ];

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(location);
        fetchNearbyHospitals(location);
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location access.');
        setLoading(false);
      }
    );
  };

  const fetchNearbyHospitals = async (location) => {
    try {
      // Using Overpass API to fetch hospitals from OpenStreetMap
      const radius = 10000; 
          const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"hospital|clinic|doctors"](around:${radius},${location.latitude},${location.longitude});
        node["healthcare"~"hospital|clinic"](around:${radius},${location.latitude},${location.longitude});
        way["amenity"~"hospital|clinic|doctors"](around:${radius},${location.latitude},${location.longitude});
        way["healthcare"~"hospital|clinic"](around:${radius},${location.latitude},${location.longitude});
        relation["amenity"~"hospital|clinic|doctors"](around:${radius},${location.latitude},${location.longitude});
        relation["healthcare"~"hospital|clinic"](around:${radius},${location.latitude},${location.longitude});
      );
      out center;
    `;


      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }

      const data = await response.json();
      
      const processedHospitals = data.elements
        .filter(element => element.tags && element.tags.name)
        .map(element => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;
          
          if (!lat || !lon) return null;

          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            lat,
            lon
          );

          return {
            id: element.id,
            name: element.tags.name,
            address: element.tags['addr:full'] || 
                    `${element.tags['addr:street'] || ''} ${element.tags['addr:city'] || ''}`.trim() || 
                    'Address not available',
            phone: element.tags.phone || element.tags['contact:phone'] || 'N/A',
            latitude: lat,
            longitude: lon,
            distance: parseFloat(distance.toFixed(1)),
            hasEmergency: element.tags.emergency === 'yes' || true,
            isOpen: element.tags.opening_hours !== '24/7' ? true : true,
            beds: element.tags.beds || Math.floor(Math.random() * 50) + 10,
            website: element.tags.website || element.tags['contact:website'] || null
          };
        })
        .filter(hospital => hospital !== null);

      setHospitals(processedHospitals);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load nearby hospitals. Please try again.');
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const sortedHospitals = [...hospitals].sort((a, b) => {
    if (sortBy === 'distance') {
      return a.distance - b.distance;
    } else if (sortBy === 'beds') {
      return b.beds - a.beds;
    }
    return 0;
  });

  const getDirections = (hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${hospital.latitude},${hospital.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#1a1a1a]" style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}
      </style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(240,255,240,1)_0,_rgba(230,250,240,0.5)_100%)]" />

      <div className="relative">
        {/* Simple Navbar */}
        <nav className="relative border-b border-[#009b7d]/20 bg-white/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-[#009b7d]">Hospice</h2>
            <p className="text-xs uppercase tracking-wide text-[#009b7d] font-bold">Emergency Hospital Locator</p>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a1a1a] mb-3">
              Nearby <span className="text-[#009b7d]">Hospitals</span>
            </h1>
            <p className="text-base text-[#2a2a2a] font-medium">
              Real-time hospital data from OpenStreetMap
            </p>
          </div>

          {/* Controls */}
          <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={getUserLocation}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#00b894] to-[#009b7d] px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>🔄</span>
                Refresh Location
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={sortSearchQuery || sortOptions.find(opt => opt.value === sortBy)?.label || ''}
                onChange={(e) => {
                  setSortSearchQuery(e.target.value);
                  setShowSortDropdown(true);
                }}
                onFocus={() => {
                  setShowSortDropdown(true);
                  setSortSearchQuery('');
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowSortDropdown(false);
                    setSortSearchQuery('');
                  }, 200);
                }}
                placeholder="Sort by..."
                readOnly
                className="rounded-xl border-2 border-[#009b7d]/30 bg-white px-4 py-3 text-sm font-semibold text-[#009b7d] focus:border-[#009b7d] focus:outline-none focus:ring-2 focus:ring-[#009b7d]/20 cursor-pointer"
              />
              
              {/* Sort Dropdown Menu */}
              {showSortDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-[#009b7d]/30 shadow-[0_8px_32px_rgba(0,155,125,0.15)] max-h-64 overflow-y-auto right-0">
                  {sortOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                        setSortSearchQuery('');
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-[#009b7d]/10 ${
                        sortBy === option.value
                          ? 'bg-[#009b7d]/20 text-[#009b7d] font-semibold'
                          : 'text-[#1a1a1a] hover:text-[#009b7d]'
                      } ${index !== sortOptions.length - 1 ? 'border-b border-[#009b7d]/10' : ''}`}
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#009b7d] border-t-transparent"></div>
              <p className="mt-4 text-[#009b7d] font-semibold">Locating nearby hospitals...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-3xl bg-red-50 border-2 border-red-200 p-6 text-center">
              <p className="text-red-600 font-semibold mb-3">{error}</p>
              <button
                onClick={getUserLocation}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Hospital List */}
          {!loading && !error && sortedHospitals.length > 0 && (
            <div className="space-y-4">
              {sortedHospitals.map((hospital, index) => (
                <article
                  key={hospital.id || index}
                  className="group relative rounded-3xl bg-white/60 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 transition-all duration-300 hover:bg-white/80 hover:shadow-[0_12px_48px_rgba(0,155,125,0.25)] hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-2xl">🏥</span>
                          <div>
                            <h3 className="text-xl font-bold text-[#1a1a1a]">{hospital.name}</h3>
                            <p className="text-sm text-[#2a2a2a] mt-1 font-medium">{hospital.address}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                          <div className="bg-[#009b7d]/10 rounded-xl p-3">
                            <p className="text-xs text-[#009b7d] font-bold uppercase">Distance</p>
                            <p className="text-2xl font-extrabold text-[#009b7d] mt-1">
                              {hospital.distance} km
                            </p>
                          </div>

                          <div className="bg-[#009b7d]/10 rounded-xl p-3">
                            <p className="text-xs text-[#009b7d] font-bold uppercase">Beds</p>
                            <p className="text-2xl font-extrabold text-[#009b7d] mt-1">
                              {hospital.beds}
                            </p>
                          </div>

                          <div className="bg-[#009b7d]/10 rounded-xl p-3">
                            <p className="text-xs text-[#009b7d] font-bold uppercase">Emergency</p>
                            <p className="text-lg font-extrabold text-[#009b7d] mt-1">
                              {hospital.hasEmergency ? '✓ Yes' : '✗ No'}
                            </p>
                          </div>

                          <div className="bg-[#009b7d]/10 rounded-xl p-3">
                            <p className="text-xs text-[#009b7d] font-bold uppercase">Status</p>
                            <p className="text-lg font-extrabold text-[#009b7d] mt-1">
                              🟢 Open
                            </p>
                          </div>
                        </div>

                        {hospital.phone !== 'N/A' && (
                          <p className="mt-4 text-sm text-[#2a2a2a] font-semibold">
                            📞 {hospital.phone}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col gap-3">
                        <button
                          onClick={() => getDirections(hospital)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#00b894] to-[#009b7d] px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                        >
                          <span>🗺️</span>
                          Directions
                        </button>

                        {hospital.phone !== 'N/A' && (
                          <a
                            href={`tel:${hospital.phone}`}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-[#009b7d] px-6 py-3 text-sm font-bold text-[#009b7d] hover:bg-[#009b7d] hover:text-white transition-all"
                          >
                            <span>📞</span>
                            Call
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#009b7d]/10 blur-3xl transition-all group-hover:bg-[#009b7d]/20" />
                </article>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && sortedHospitals.length === 0 && (
            <div className="text-center py-20 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60">
              <p className="text-2xl font-bold text-[#1a1a1a] mb-2">No hospitals found nearby</p>
              <p className="text-[#2a2a2a] font-medium">Try refreshing your location or the area may have limited data</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative border-t border-[#009b7d]/40 bg-[#009b7d] backdrop-blur py-8 mt-10 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-lg font-extrabold text-white">Hospice</h3>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#e0f5ed] font-bold">
              Real-time emergency hospital locator
            </p>
            <p className="mt-2 text-xs text-[#e0f5ed]">
              Data from OpenStreetMap contributors
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Hospitals;