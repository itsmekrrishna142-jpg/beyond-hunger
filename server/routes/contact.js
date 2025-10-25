const express = require('express');
const Contact = require('../models/contact');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const contact = new Contact({
      ...req.body,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        appVersion: req.get('X-App-Version') || '1.0.0',
      },
    });

    await contact.save();

    // Send email notification to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'admin@beyondhunger.com',
      subject: `New Contact Form Submission: ${contact.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contact.message}</p>
        <hr>
        <p><small>Received from: ${contact.source} at ${contact.createdAt}</small></p>
      `,
    };

    // Send email (non-blocking)
    transporter.sendMail(mailOptions).catch(console.error);

    // Send auto-response to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: 'Thank you for contacting Beyond Hunger Photography',
      html: `
        <h2>Thank You for Your Message</h2>
        <p>Dear ${contact.name},</p>
        <p>We have received your message and will get back to you within 24-48 hours.</p>
        <p><strong>Your Message:</strong></p>
        <p><em>${contact.message}</em></p>
        <hr>
        <p>Best regards,<br>The Beyond Hunger Team</p>
      `,
    };

    transporter.sendMail(userMailOptions).catch(console.error);

    res.status(201).json({
      status: 'success',
      message: 'Contact form submitted successfully',
      data: {
        contact,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to submit contact form',
      error: error.message,
    });
  }
});

// Get contact submissions (Admin only)
router.get('/', async (req, res) => {
  try {
    const {
      status,
      priority,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const contacts = await Contact.find(filter)
      .populate('assignedTo', 'name firstName lastName')
      .populate('bookingReference', 'service sessionDate')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      status: 'success',
      results: contacts.length,
      data: {
        contacts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to fetch contact submissions',
      error: error.message,
    });
  }
});

// Update contact status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, priority, assignedTo },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name firstName lastName');

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact submission not found',
      });
    }

    res.json({
      status: 'success',
      data: {
        contact,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to update contact status',
      error: error.message,
    });
  }
});

// Add response to contact
router.post('/:id/response', async (req, res) => {
  try {
    const { message } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          responses: {
            responder: req.user.id,
            message,
          },
        },
        status: 'in_progress',
      },
      { new: true, runValidators: true }
    ).populate('responses.responder', 'name firstName lastName');

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact submission not found',
      });
    }

    // Send response email to user
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: `Re: Your contact form submission - ${contact.subject}`,
      html: `
        <h2>Response to Your Inquiry</h2>
        <p>Dear ${contact.name},</p>
        <p>Thank you for contacting Beyond Hunger Photography. Here is our response:</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #FF0000;">
          <p><strong>Our Response:</strong></p>
          <p>${message}</p>
        </div>
        <p>If you have any further questions, please don't hesitate to reply to this email.</p>
        <hr>
        <p>Best regards,<br>The Beyond Hunger Team</p>
      `,
    };

    transporter.sendMail(mailOptions).catch(console.error);

    res.json({
      status: 'success',
      data: {
        contact,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to add response',
      error: error.message,
    });
  }
});

// Get contact statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const newCount = await Contact.countDocuments({ status: 'new' });
    const inProgress = await Contact.countDocuments({ status: 'in_progress' });
    const resolved = await Contact.countDocuments({ status: 'resolved' });

    const priorityStats = await Contact.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const subjectStats = await Contact.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      status: 'success',
      data: {
        summary: {
          total,
          new: newCount,
          inProgress,
          resolved,
        },
        priorityStats,
        subjectStats,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to fetch contact statistics',
      error: error.message,
    });
  }
});

module.exports = router;