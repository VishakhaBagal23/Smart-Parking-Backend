const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');

// GET ALL SLOTS
router.get('/all', async (req, res) => {
  try {
    const slots = await Slot.find().sort({ floor: 1 });

    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ✅ ADD THIS HERE ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

// SLOT STATS (TOTAL / AVAILABLE / OCCUPIED)
router.get('/stats', async (req, res) => {
  try {
    const total = await Slot.countDocuments();
    const available = await Slot.countDocuments({ status: 'AVAILABLE' });
    const occupied = await Slot.countDocuments({ status: 'OCCUPIED' });

    res.json({
      success: true,
      data: {
        total,
        available,
        occupied
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const count = await Slot.countDocuments();

    if (count > 0) {
      return res.json({ success: true, message: "Slots already exist" });
    }

    const slots = [];

    for (let i = 1; i <= 10; i++) {
      slots.push({
        slotNumber: `S${i}`,
        floor: 1,
        slotType: i <= 4 ? 'BIKE' : i <= 8 ? 'CAR' : 'TRUCK',
        status: 'AVAILABLE'
      });
    }

    await Slot.insertMany(slots);

    res.json({
      success: true,
      message: "Slots created successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ ADD SLOT (NEW)
router.post('/add', async (req, res) => {
  try {
    const { slotNumber, floor, slotType } = req.body;

    const existing = await Slot.findOne({ slotNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Slot already exists'
      });
    }

    const slot = await Slot.create({
      slotNumber,
      floor,
      slotType
    });

    res.status(201).json({
      success: true,
      message: 'Slot added successfully',
      data: slot
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;