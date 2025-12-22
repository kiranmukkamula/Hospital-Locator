import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import HospitalMap from "./HospitalMap";


const HospitalList = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);


  

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedOwnership, setSelectedOwnership] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [ownershipSearchQuery, setOwnershipSearchQuery] = useState('');
  const [showOwnershipDropdown, setShowOwnershipDropdown] = useState(false);
  const [filteredOwnershipTypes, setFilteredOwnershipTypes] = useState([]);

  // Category options
  const categories = [
    'General Hospital',
    'Multi-Specialty Hospital',
    'Specialty Hospital',
    'Clinic / Nursing Home',
    'Diagnostic Center',
    'Emergency & Trauma Center',
    'Maternity Hospital',
    "Children's Hospital"
  ];

  // Medical Specialty options
  const specialties = [
    'Cardiology (Heart)',
    'Orthopedics (Bones & Joints)',
    'Neurology (Brain & Nerves)',
    'Gynecology & Obstetrics',
    'Pediatrics',
    'Dermatology (Skin)',
    'ENT (Ear, Nose, Throat)',
    'Ophthalmology (Eye)',
    'Oncology (Cancer)',
    'Psychiatry / Mental Health',
    'Nephrology (Kidney)',
    'Gastroenterology',
    'Pulmonology (Lungs)',
    'Urology',
    'Dentistry'
  ];

  // Ownership options
  const ownershipTypes = [
    'Government Hospital',
    'Private Hospital',
    'Trust / NGO Hospital',
    'Teaching Hospital (Medical College)'
  ];

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    // Filter categories based on search query
    if (categorySearchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const query = categorySearchQuery.toLowerCase().trim();
      const filtered = categories.filter(cat =>
        cat.toLowerCase().includes(query)
      );
      setFilteredCategories(filtered);
    }
  }, [categorySearchQuery]);

  useEffect(() => {
    // Filter ownership types based on search query
    if (ownershipSearchQuery.trim() === '') {
      setFilteredOwnershipTypes(ownershipTypes);
    } else {
      const query = ownershipSearchQuery.toLowerCase().trim();
      const filtered = ownershipTypes.filter(type =>
        type.toLowerCase().includes(query)
      );
      setFilteredOwnershipTypes(filtered);
    }
  }, [ownershipSearchQuery]);

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
          latitude: position.coords.latitude,  //
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
      const radius = 10000; // 10km in meters
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

    
      const response = await fetch("https://overpass.kumi.systems/api/interpreter", {
      method: "POST",
      headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(query)}`,
      });


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
            address: element.tags['addr:full'] || element.tags['addr:street'] || 'Address not available',
            phone: element.tags.phone || element.tags['contact:phone'] || 'N/A',
            latitude: lat,
            longitude: lon,
            distance: distance.toFixed(2),
            beds: element.tags.beds || Math.floor(Math.random() * 50) + 10,
            hasEmergency: element.tags.emergency === 'yes' || element.tags['emergency:yes'] === 'yes',
            category: determineCategory(element.tags),
            specialties: determineSpecialties(element.tags),
            ownership: determineOwnership(element.tags)
          };
        })
        .filter(h => h !== null)
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

      setHospitals(processedHospitals);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Failed to load hospitals. Please try again.');
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const determineCategory = (tags) => {
    const name = (tags.name || '').toLowerCase();
    if (name.includes('emergency') || name.includes('trauma')) return 'Emergency & Trauma Center';
    if (name.includes('maternity') || name.includes('women')) return 'Maternity Hospital';
    if (name.includes('children') || name.includes('pediatric')) return "Children's Hospital";
    if (name.includes('clinic') || name.includes('nursing')) return 'Clinic / Nursing Home';
    if (name.includes('diagnostic')) return 'Diagnostic Center';
    if (tags.amenity === 'hospital') {
      if (tags.speciality) return 'Specialty Hospital';
      return 'General Hospital';
    }
    return 'Multi-Specialty Hospital';
  };

  const determineSpecialties = (tags) => {
    const specialties = [];
    const name = (tags.name || '').toLowerCase();
    const speciality = (tags.speciality || '').toLowerCase();
    
    if (name.includes('cardiac') || name.includes('heart') || speciality.includes('cardiac')) specialties.push('Cardiology (Heart)');
    if (name.includes('ortho') || name.includes('bone') || speciality.includes('ortho')) specialties.push('Orthopedics (Bones & Joints)');
    if (name.includes('neuro') || name.includes('brain') || speciality.includes('neuro')) specialties.push('Neurology (Brain & Nerves)');
    if (name.includes('gynec') || name.includes('women') || speciality.includes('gynec')) specialties.push('Gynecology & Obstetrics');
    if (name.includes('pediatric') || name.includes('children') || speciality.includes('pediatric')) specialties.push('Pediatrics');
    if (name.includes('derma') || name.includes('skin') || speciality.includes('derma')) specialties.push('Dermatology (Skin)');
    if (name.includes('ent') || name.includes('ear') || speciality.includes('ent')) specialties.push('ENT (Ear, Nose, Throat)');
    if (name.includes('eye') || name.includes('ophthal') || speciality.includes('eye')) specialties.push('Ophthalmology (Eye)');
    if (name.includes('cancer') || name.includes('onco') || speciality.includes('onco')) specialties.push('Oncology (Cancer)');
    if (name.includes('psych') || name.includes('mental') || speciality.includes('psych')) specialties.push('Psychiatry / Mental Health');
    if (name.includes('nephro') || name.includes('kidney') || speciality.includes('nephro')) specialties.push('Nephrology (Kidney)');
    if (name.includes('gastro') || name.includes('digestive') || speciality.includes('gastro')) specialties.push('Gastroenterology');
    if (name.includes('pulmo') || name.includes('lung') || speciality.includes('pulmo')) specialties.push('Pulmonology (Lungs)');
    if (name.includes('uro') || speciality.includes('uro')) specialties.push('Urology');
    if (name.includes('dental') || name.includes('tooth') || speciality.includes('dental')) specialties.push('Dentistry');
    
    return specialties.length > 0 ? specialties : ['General Medicine'];
  };

  const determineOwnership = (tags) => {
    const name = (tags.name || '').toLowerCase();
    if (name.includes('government') || name.includes('govt') || tags['operator:type'] === 'government') return 'Government Hospital';
    if (name.includes('trust') || name.includes('ngo') || tags['operator:type'] === 'ngo') return 'Trust / NGO Hospital';
    if (name.includes('medical college') || name.includes('teaching') || tags['operator:type'] === 'university') return 'Teaching Hospital (Medical College)';
    return 'Private Hospital';
  };

  const toggleSpecialty = (specialty) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  // const getDirections = (hospital) => {
  //   if (!userLocation) {
  //     alert('Location not available. Please enable location access.');
  //     return;
  //   }
  //   const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${hospital.latitude},${hospital.longitude}`;
  //   window.open(url, '_blank');
  // };

  const getDirections = (hospital) => {
  if (!userLocation) return;

  const confirmNav = window.confirm(
    `Open Google Maps directions to ${hospital.name}?`
  );

  if (!confirmNav) return;

  const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${hospital.latitude},${hospital.longitude}`;
  window.open(url, "_blank");
};


  const filteredHospitals = hospitals.filter(hospital => {
    if (selectedCategory && hospital.category !== selectedCategory) return false;
    if (selectedSpecialties.length > 0) {
      const hasMatchingSpecialty = selectedSpecialties.some(spec => 
        hospital.specialties.includes(spec)
      );
      if (!hasMatchingSpecialty) return false;
    }
    if (selectedOwnership && hospital.ownership !== selectedOwnership) return false;
    return true;
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#1a1a1a]" style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}
      </style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(240,255,240,1)_0,_rgba(230,250,240,0.5)_100%)]" />

      <div className="relative">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            {userLocation && hospitals.length > 0 && (
  <div className="mb-6 rounded-3xl overflow-hidden shadow-lg">
    <HospitalMap
      userLocation={userLocation}
      hospitals={filteredHospitals.slice(0, 20)}
      onHospitalClick={getDirections}
    />
  </div>
)}

            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a1a1a] mb-3">
              List of <span className="text-[#009b7d]">Hospitals</span>
            </h1>
            <p className="text-base text-[#2a2a2a] font-medium">
              Filter hospitals by category, specialty, and ownership type
            </p>
          </div>

          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
            {/* Filters Sidebar */}
            <aside className="space-y-6">
        
             

              {/* Medical Specialty Filter */}
              <div className="rounded-3xl bg-white/60 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60">
                <h3 className="text-lg font-bold text-[#009b7d] mb-4">🩺 Medical Specialty</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {specialties.map(specialty => (
                    <label key={specialty} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={() => toggleSpecialty(specialty)}
                        className="w-5 h-5 rounded border-2 border-[#009b7d]/30 text-[#009b7d] focus:ring-2 focus:ring-[#009b7d]/20 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-[#2a2a2a] group-hover:text-[#009b7d] transition-colors">
                        {specialty}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ownership Filter - Searchable Dropdown */}
              <div className="rounded-3xl bg-white/60 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60">
                <h3 className="text-lg font-bold text-[#009b7d] mb-4">🏛 Hospital Ownership</h3>
                <div className="relative">
                  <input
                    type="text"
                    value={ownershipSearchQuery}
                    onChange={(e) => {
                      setOwnershipSearchQuery(e.target.value);
                      setShowOwnershipDropdown(true);
                      if (e.target.value === '') {
                        setSelectedOwnership('');
                      }
                    }}
                    onFocus={() => setShowOwnershipDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowOwnershipDropdown(false), 200);
                    }}
                    placeholder="Search or type ownership type..."
                    className="w-full rounded-xl border-2 border-[#009b7d]/30 bg-white px-4 py-3 text-sm font-semibold text-[#009b7d] focus:border-[#009b7d] focus:outline-none focus:ring-2 focus:ring-[#009b7d]/20"
                  />
                  {ownershipSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setOwnershipSearchQuery('');
                        setSelectedOwnership('');
                        setShowOwnershipDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#009b7d] hover:text-[#007a63] transition-colors"
                    >
                      ✕
                    </button>
                  )}
                  
                  {/* Ownership Dropdown Menu */}
                  {showOwnershipDropdown && filteredOwnershipTypes.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-[#009b7d]/30 shadow-[0_8px_32px_rgba(0,155,125,0.15)] max-h-64 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOwnership('');
                          setOwnershipSearchQuery('');
                          setShowOwnershipDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-[#009b7d]/10 ${
                          selectedOwnership === ''
                            ? 'bg-[#009b7d]/20 text-[#009b7d] font-semibold'
                            : 'text-[#1a1a1a] hover:text-[#009b7d]'
                        } border-b border-[#009b7d]/10`}
                      >
                        <span>All Types</span>
                      </button>
                      {filteredOwnershipTypes.map((type, index) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSelectedOwnership(type);
                            setOwnershipSearchQuery(type);
                            setShowOwnershipDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-[#009b7d]/10 ${
                            selectedOwnership === type
                              ? 'bg-[#009b7d]/20 text-[#009b7d] font-semibold'
                              : 'text-[#1a1a1a] hover:text-[#009b7d]'
                          } ${index !== filteredOwnershipTypes.length - 1 ? 'border-b border-[#009b7d]/10' : ''}`}
                        >
                          <span>{type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {showOwnershipDropdown && filteredOwnershipTypes.length === 0 && ownershipSearchQuery.trim() !== '' && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-[#009b7d]/30 shadow-[0_8px_32px_rgba(0,155,125,0.15)] p-4">
                      <p className="text-sm text-[#2a2a2a] font-medium text-center">
                        No ownership types found matching "{ownershipSearchQuery}"
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Selected Ownership Display */}
                {selectedOwnership && (
                  <div className="mt-2 rounded-xl bg-[#009b7d]/10 border border-[#009b7d]/30 p-3">
                    <p className="text-xs font-bold text-[#009b7d] uppercase mb-1">Selected Ownership</p>
                    <p className="text-sm font-semibold text-[#1a1a1a]">{selectedOwnership}</p>
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedSpecialties.length > 0 || selectedOwnership) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSpecialties([]);
                    setSelectedOwnership('');
                  }}
                  className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </aside>

            {/* Hospital List */}
            <div className="space-y-4">
              {/* Loading State */}
              {loading && (
                <div className="text-center py-20 rounded-3xl bg-white/60 backdrop-blur-xl">
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

              {/* Results Count */}
              {!loading && !error && (
                <div className="text-sm font-semibold text-[#009b7d] mb-4">
                  Found {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''}
                </div>
              )}

              {/* Hospital Cards */}
              {!loading && !error && filteredHospitals.length > 0 && (
                <div className="space-y-4">
                  {filteredHospitals.map((hospital, index) => (
                    <article
                      key={hospital.id || index}
                      className="group relative rounded-3xl bg-white/60 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 transition-all duration-300 hover:bg-white/80 hover:shadow-[0_12px_48px_rgba(0,155,125,0.25)] hover:-translate-y-1 overflow-hidden cursor-pointer"
                      onClick={() => getDirections(hospital)}
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
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs font-semibold text-[#009b7d] bg-[#009b7d]/10 px-2 py-1 rounded-lg">
                                    {hospital.category}
                                  </span>
                                  <span className="text-xs font-semibold text-[#009b7d] bg-[#009b7d]/10 px-2 py-1 rounded-lg">
                                    {hospital.ownership}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {hospital.specialties.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-bold text-[#009b7d] uppercase mb-2">Specialties:</p>
                                <div className="flex flex-wrap gap-2">
                                  {hospital.specialties.slice(0, 3).map((spec, idx) => (
                                    <span key={idx} className="text-xs font-medium text-[#2a2a2a] bg-white/60 px-2 py-1 rounded-lg border border-[#009b7d]/20">
                                      {spec}
                                    </span>
                                  ))}
                                  {hospital.specialties.length > 3 && (
                                    <span className="text-xs font-medium text-[#009b7d]">+{hospital.specialties.length - 3} more</span>
                                  )}
                                </div>
                              </div>
                            )}

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
                              onClick={(e) => {
                                e.stopPropagation();
                                getDirections(hospital);
                              }}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#00b894] to-[#009b7d] px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                            >
                              <span>🗺️</span>
                              Directions
                            </button>

                            {hospital.phone !== 'N/A' && (
                              <a
                                href={`tel:${hospital.phone}`}
                                onClick={(e) => e.stopPropagation()}
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
              {!loading && !error && filteredHospitals.length === 0 && (
                <div className="text-center py-20 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60">
                  <p className="text-2xl font-bold text-[#1a1a1a] mb-2">No hospitals found</p>
                  <p className="text-[#2a2a2a] font-medium">Try adjusting your filters or refresh your location</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-[#009b7d]/40 bg-[#009b7d] backdrop-blur py-8 mt-10 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-lg font-extrabold text-white">Hospice</h3>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#e0f5ed] font-bold">
              Real-time emergency hospital locator
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HospitalList;

