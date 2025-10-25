const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment');
const Booking = require('../models/booking');
const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { bookingId, amount, currency = 'gbp' } = req.body;

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found',
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/pence
      currency,
      metadata: {
        bookingId: bookingId.toString(),
        userId: req.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      paymentIntentId: paymentIntent.id,
      status: 'pending',
    });

    res.json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
});

// Confirm payment
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Update payment record
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: paymentIntent.status,
        cardDetails: paymentIntent.charges?.data[0]?.payment_method_details?.card
          ? {
              last4: paymentIntent.charges.data[0].payment_method_details.card.last4,
              brand: paymentIntent.charges.data[0].payment_method_details.card.brand,
              country: paymentIntent.charges.data[0].payment_method_details.card.country,
            }
          : undefined,
      },
      { new: true }
    ).populate('booking');

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found',
      });
    }

    // Update booking payment status
    if (paymentIntent.status === 'succeeded') {
      await Booking.findByIdAndUpdate(payment.booking._id, {
        paymentStatus: 'paid',
        status: 'confirmed',
      });
    }

    res.json({
      status: 'success',
      data: {
        payment,
        booking: payment.booking,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to confirm payment',
      error: error.message,
    });
  }
});

// Get payment history for user
router.get('/history', async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('booking', 'service sessionDate sessionTime')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      results: payments.length,
      data: {
        payments,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to fetch payment history',
      error: error.message,
    });
  }
});

// Refund payment
router.post('/:id/refund', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found',
      });
    }

    // Create refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
      amount: payment.amount,
      reason: req.body.reason || 'requested_by_customer',
    });

    // Update payment record
    payment.refunds.push({
      amount: refund.amount,
      reason: refund.reason,
      created: new Date(refund.created * 1000),
      status: refund.status,
    });
    
    payment.status = 'refunded';
    await payment.save();

    // Update booking status
    await Booking.findByIdAndUpdate(payment.booking, {
      status: 'cancelled',
      paymentStatus: 'refunded',
    });

    res.json({
      status: 'success',
      data: {
        refund,
        payment,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to process refund',
      error: error.message,
    });
  }
});

module.exports = router;