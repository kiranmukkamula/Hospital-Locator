import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import HospitalMap from "./HospitalMap";
import Footer from './Footer';


const HospitalList = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);


  const [showLocationModal, setShowLocationModal] = useState(true);


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

  // useEffect(() => {
  //   getUserLocation();
  // }, []);
const handleAllowLocation = () => {
  setShowLocationModal(false);
  getUserLocation();
};

const handleDenyLocation = () => {
  navigate("/"); // redirect to home
};

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
//16.5062, 80.6480

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

  const isNearPunjabRegion = (location) => {
  return (
    location.latitude >= 29 &&
    location.latitude <= 33 &&
    location.longitude >= 73 &&
    location.longitude <= 77
  );
};

const getPunjabFixedHospitals = (userLocation) => {
  return [
    {
      id: "punjab-1",
      name: "Shri Baldev Raj Mittal Hospital",
      address: "7P44+JRR, Khajurla, Punjab 144411",
      destinationAddress: "7P44+JRR, Khajurla, Punjab 144411",
      phone: "N/A",
      latitude: 31.2582,
      longitude: 75.7079,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        31.2582,
        75.7079
      ).toFixed(2),
      beds: 30,
      hasEmergency: true,
      category: "General Hospital",
      specialties: ["General Medicine", "Emergency Care"],
      ownership: "Trust / NGO Hospital"
    }
  ];
};

const getRoadDistance = async (origin, destination) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=false`;

    const res = await fetch(url);

    // 🚨 handle rate limit / HTML response
    if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
      return null;
    }

    const data = await res.json();

    if (!data.routes || !data.routes.length) return null;

    return (data.routes[0].distance / 1000).toFixed(2);
  } catch {
    return null;
  }
};


  const fetchNearbyHospitals = async (location) => {
    console.log("Location fetched:", location);
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
      
const roughHospitals = data.elements
  .filter(e => e.tags && e.tags.name)
  .map(e => {
    const lat = e.lat || e.center?.lat;
    const lon = e.lon || e.center?.lon;
    if (!lat || !lon) return null;

    return {
      id: e.id,
      name: e.tags.name,
      address:
        e.tags['addr:full'] ||
        e.tags['addr:street'] ||
        'Address not available',
      phone: e.tags.phone || e.tags['contact:phone'] || 'N/A',
      latitude: lat,
      longitude: lon,
      roughDistance: calculateDistance(
        location.latitude,
        location.longitude,
        lat,
        lon
      ),
      beds: e.tags.beds || Math.floor(Math.random() * 50) + 10,
    hasEmergency: true,
      category: determineCategory(e.tags),
      specialties: determineSpecialties(e.tags),
      ownership: determineOwnership(e.tags)
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.roughDistance - b.roughDistance);
// STEP 2: Accurate road distance ONLY for top 5 hospitals
const topHospitals = [];

for (const h of roughHospitals.slice(0, 5)) {
  const road = await getRoadDistance(location, h);

  topHospitals.push({
    ...h,
    distance: road ?? h.roughDistance.toFixed(2)
  });

  // ⏱ small delay to avoid OSRM reset
  await new Promise(res => setTimeout(res, 300));
}

// STEP 3: Remaining hospitals use rough distance
const remainingHospitals = roughHospitals.slice(5).map(h => ({
  ...h,
  distance: h.roughDistance.toFixed(2)
}));
let finalHospitalList = [...topHospitals, ...remainingHospitals];
if (isNearPunjabRegion(location)) {
  const fixedHospitals = getPunjabFixedHospitals(location);
  finalHospitalList = [
    ...fixedHospitals,
    ...finalHospitalList.filter(
      h => !fixedHospitals.some(f => f.name === h.name)
    )
  ];
}



setHospitals(finalHospitalList);
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


const getDirections = (hospital) => {
  if (!userLocation) return;

  const confirmNav = window.confirm(
    `Open Google Maps directions to ${hospital.name}?`
  );
  if (!confirmNav) return;

  let destination;

  // ✅ If custom address exists, use it directly
  if (hospital.destinationAddress) {
    destination = encodeURIComponent(hospital.destinationAddress);
  } else {
    destination = `${hospital.latitude},${hospital.longitude}`;
  }

  const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination}`;
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
      {showLocationModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-[#009b7d]/30 p-8 text-center">

      <div className="text-5xl mb-4">📍</div>

      <h2 className="text-2xl font-extrabold text-[#009b7d] mb-3">
        Allow Location Access
      </h2>

      <p className="text-[#2a2a2a] font-medium mb-6">
        We need your location to show nearby hospitals and emergency services.
      </p>

      <div className="flex gap-4">
        <button
          onClick={handleAllowLocation}
          className="flex-1 rounded-xl bg-gradient-to-br from-[#00b894] to-[#009b7d] px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all"
        >
          ✅ Allow
        </button>

        <button
          onClick={handleDenyLocation}
          className="flex-1 rounded-xl border-2 border-[#009b7d] px-6 py-3 text-sm font-bold text-[#009b7d] hover:bg-[#009b7d] hover:text-white transition-all"
        >
          ❌ Deny
        </button>
      </div>

    </div>
  </div>
)}


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
        <Footer />
      </div>
    </div>
  );
};

export default HospitalList;

