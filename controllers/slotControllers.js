const Slot = require('../models/Slot');

// create slot
exports.createSlot = async (req, res) => {
  try {

    const { slotNumber, floor, slotType } = req.body;

    const existingSlot = await Slot.findOne({ slotNumber });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'Slot already exists !!'
      });
    }

    const slot = await Slot.create({
      slotNumber,
      floor,
      slotType,
      status: 'AVAILABLE'
    });

    return res.status(201).json({
      success: true,
      message: 'Slot created successfully !!',
      data: slot
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get all slots
exports.getAllSlots = async (req, res) => {
  try {

    const slots = await Slot.find().sort({ floor: 1 });

    return res.status(200).json({
      success: true,
      data: slots
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// available slots
exports.getAvailableSlots = async (req, res) => {
  try {

    const { slotType } = req.query;

    const query = {
      status: 'AVAILABLE'
    };

    if (slotType) {
      query.slotType = slotType;
    }

    const slots = await Slot.find(query);

    return res.status(200).json({
      success: true,
      data: slots
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// update slot
exports.updateSlot = async (req, res) => {
  try {

    const { slotId } = req.params;
    const { status } = req.body;

    const slot = await Slot.findByIdAndUpdate(
      slotId,
      { status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Slot updated !!',
      data: slot
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};