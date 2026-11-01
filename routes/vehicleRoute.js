const express = require('express')

const router = express.Router()

const {
    addVehicle,
    getVehicles,
    getVehiclesById,
    updateVehicle
} = require('../controllers/vehicleController')

// Add vehicle
router.post('/add', addVehicle)

// Get all vehicles
router.get('/all', getVehicles)

// Get single vehicle
router.get('/:ObjectId', getVehiclesById)

// Update vehicle
router.put('/update/:ObjectId', updateVehicle)

module.exports = router