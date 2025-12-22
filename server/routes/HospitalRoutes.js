// routes/HospitalRoutes.js
const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// @route   POST /api/hospitals/nearby
// @desc    Get nearby hospitals based on user location
// @access  Public
router.post("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: "Latitude and longitude are required" 
      });
    }

    // Convert radius from meters to km
    const radiusInKm = radius / 1000;

    // Get all hospitals
    const allHospitals = await Hospital.find();

    // Calculate distances and filter by radius
    const hospitalsWithDistance = allHospitals
      .map(hospital => {
        const distance = calculateDistance(
          latitude,
          longitude,
          hospital.location.coordinates[1],
          hospital.location.coordinates[0]
        );
        
        return {
          _id: hospital._id,
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
          latitude: hospital.location.coordinates[1],
          longitude: hospital.location.coordinates[0],
          availableBeds: hospital.availableBeds,
          hasEmergency: hospital.hasEmergency,
          isOpen: hospital.isOpen,
          distance: parseFloat(distance.toFixed(1))
        };
      })
      .filter(hospital => hospital.distance <= radiusInKm)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      count: hospitalsWithDistance.length,
      hospitals: hospitalsWithDistance
    });
  } catch (error) {
    console.error("Error fetching nearby hospitals:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

// @route   GET /api/hospitals
// @desc    Get all hospitals
// @access  Public
router.get("/", async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json({
      success: true,
      count: hospitals.length,
      hospitals
    });
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

// @route   POST /api/hospitals
// @desc    Add a new hospital (for admin use)
// @access  Public (should be protected in production)
router.post("/", async (req, res) => {
  try {
    const { 
      name, 
      address, 
      phone, 
      latitude, 
      longitude,
      availableBeds,
      hasEmergency,
      isOpen
    } = req.body;

    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ 
        message: "Name, address, latitude, and longitude are required" 
      });
    }

    const hospital = new Hospital({
      name,
      address,
      phone,
      location: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      availableBeds: availableBeds || 0,
      hasEmergency: hasEmergency !== undefined ? hasEmergency : true,
      isOpen: isOpen !== undefined ? isOpen : true
    });

    const savedHospital = await hospital.save();
    res.status(201).json({
      success: true,
      hospital: savedHospital
    });
  } catch (error) {
    console.error("Error creating hospital:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

// @route   PUT /api/hospitals/:id
// @desc    Update hospital info
// @access  Public (should be protected in production)
router.put("/:id", async (req, res) => {
  try {
    const { availableBeds, isOpen, hasEmergency } = req.body;
    
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          availableBeds, 
          isOpen, 
          hasEmergency,
          updatedAt: Date.now()
        } 
      },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.json({
      success: true,
      hospital
    });
  } catch (error) {
    console.error("Error updating hospital:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
});

module.exports = router;