const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
