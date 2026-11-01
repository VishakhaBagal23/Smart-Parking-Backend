const express = require('express')

const router = express.Router()

const {
    dailyRevenueAggregation,
    activeVehicleAggregation,
    parkingDurationAggregation
} = require('../controllers/aggregationController')


router.get('/daily-revenue', dailyRevenueAggregation)

router.get('/active-vehicles', activeVehicleAggregation)

router.get('/parking-duration', parkingDurationAggregation)


module.exports = router