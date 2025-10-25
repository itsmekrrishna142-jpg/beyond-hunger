const express = require('express');
const Booking = require('../models/booking');
const Service = require('../models/services');
const router = express.Router();

// Get all bookings for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('service', 'title price duration')
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    // Verify service exists and get details
    const service = await Service.findById(req.body.service);
    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found'
      });
    }
    
    const booking = new Booking({
      ...req.body,
      totalAmount: service.price
    });
    
    await booking.save();
    await booking.populate('service', 'title duration');
    
    res.status(201).json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate('service', 'title');
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }
    
    res.json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to update booking',
      error: error.message
    });
  }
});

module.exports = router;