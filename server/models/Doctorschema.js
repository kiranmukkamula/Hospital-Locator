const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    min: 0
  },
  hospital: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  availability: {
    type: String,
    enum: ['Available', 'Busy', 'Offline'],
    default: 'Available'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true
})
module.exports = mongoose.model('Doctor', doctorSchema)