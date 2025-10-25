const express = require('express');
const Gallery = require('../models/gallery');
const router = express.Router();

// Get all gallery images with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      category,
      featured,
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (featured !== undefined) filter.isFeatured = featured === 'true';

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const galleries = await Gallery.find(filter)
      .populate('uploader', 'name firstName lastName')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Gallery.countDocuments(filter);

    res.json({
      status: 'success',
      results: galleries.length,
      data: {
        galleries,
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
      message: 'Failed to fetch gallery images',
      error: error.message,
    });
  }
});

// Get featured images for carousel
router.get('/featured/carousel', async (req, res) => {
  try {
    const galleries = await Gallery.find({
      isActive: true,
      isFeatured: true,
    })
      .select('title description imageUrl thumbnailUrl position')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      status: 'success',
      results: galleries.length,
      data: {
        galleries,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to fetch featured images',
      error: error.message,
    });
  }
});

// Get gallery image by ID
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate('uploader', 'name firstName lastName profile');

    if (!gallery || !gallery.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Gallery image not found',
      });
    }

    res.json({
      status: 'success',
      data: {
        gallery,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to fetch gallery image',
      error: error.message,
    });
  }
});

// Upload new gallery image (Admin/Photographer only)
router.post('/', async (req, res) => {
  try {
    const gallery = new Gallery({
      ...req.body,
      uploader: req.user.id,
    });

    await gallery.save();
    await gallery.populate('uploader', 'name firstName lastName');

    res.status(201).json({
      status: 'success',
      data: {
        gallery,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to upload gallery image',
      error: error.message,
    });
  }
});

// Update gallery image
router.patch('/:id', async (req, res) => {
  try {
    const allowedUpdates = [
      'title',
      'description',
      'category',
      'tags',
      'position',
      'isFeatured',
      'isActive',
    ];
    
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid updates',
      });
    }

    const gallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('uploader', 'name firstName lastName');

    if (!gallery) {
      return res.status(404).json({
        status: 'error',
        message: 'Gallery image not found',
      });
    }

    res.json({
      status: 'success',
      data: {
        gallery,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to update gallery image',
      error: error.message,
    });
  }
});

// Get gallery categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Gallery.distinct('category', { isActive: true });
    
    res.json({
      status: 'success',
      data: {
        categories,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
});

module.exports = router;