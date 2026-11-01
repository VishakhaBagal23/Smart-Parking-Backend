const Vehicle = require('../models/vehicle'); 

// add vehicle
exports.addVehicle = async (req, res) => {
  try {

    let { vehicleNumber, ownerName, mobileNo, vehicleType } = req.body;

    if (!vehicleNumber || !ownerName || !mobileNo || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    vehicleNumber = vehicleNumber.toUpperCase();
    vehicleType = vehicleType.toUpperCase();

    const existingVehicle = await Vehicle.findOne({ vehicleNumber });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle already exists'
      });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      ownerName,
      mobileNo,
      vehicleType
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle added successfully !!',
      data: vehicle
    });

  } catch (error) {
    console.log("ADD VEHICLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get all vehicles
exports.getVehicles = async (req, res) => {
  try {

    const allVehicle = await Vehicle.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: allVehicle
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get by id
exports.getVehiclesById = async (req, res) => {
  try {

    const id = req.params.id;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found !!'
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// update vehicle
exports.updateVehicle = async (req, res) => {
  try {

    const id = req.params.id;

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found !!'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully !!',
      data: updatedVehicle
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};