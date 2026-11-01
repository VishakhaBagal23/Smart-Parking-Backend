const Payment = require('../models/Payment')
const Vehicle = require('../models/Vehicle')
const Booking = require('../models/Booking')
const Slot = require('../models/Slot')

exports.dailyRevenueAggregation = async(req,res)=>{
    try{

        const data = await Payment.aggregate([
            {
                $group:{
                    _id:{
                        day:{
                            $dayOfMonth:"$paymentDate"
                        },
                        month:{
                            $month:"$paymentDate"
                        },
                        year:{
                            $year:"$paymentDate"
                        }
                    },

                    totalRevenue:{
                        $sum:"$amount"
                    },

                    totalPayments:{
                        $sum:1
                    }
                }
            },

            {
                $sort:{
                    totalRevenue:-1
                }
            }
        ])

        return res.status(200).json({
            success:true,
            data:data
        })

    }catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}



exports.activeVehicleAggregation = async(req,res)=>{
    try{

        const data = await Booking.aggregate([
            {
                $match:{
                    status:"ACTIVE"
                }
            },

            {
                $lookup:{
                    from:'vehicles',
                    localField:'vehicleId',
                    foreignField:'_id',
                    as:'vehicle'
                }
            },

            {
                $lookup:{
                    from:'slots',
                    localField:'slotId',
                    foreignField:'_id',
                    as:'slot'
                }
            },

            {
                $project:{
                    entryTime:1,

                    vehicleNumber:{
                        $arrayElemAt:[
                            '$vehicle.vehicleNumber',0
                        ]
                    },

                    vehicleType:{
                        $arrayElemAt:[
                            '$vehicle.vehicleType',0
                        ]
                    },

                    slotNumber:{
                        $arrayElemAt:[
                            '$slot.slotNumber',0
                        ]
                    }
                }
            }
        ])

        return res.status(200).json({
            success:true,
            data:data
        })

    }catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}



exports.parkingDurationAggregation = async(req,res)=>{
    try{

        const data = await Booking.aggregate([
            {
                $match:{
                    status:'COMPLETED'
                }
            },

            {
                $group:{
                    _id:null,

                    averageHours:{
                        $avg:"$totalHours"
                    },

                    maxHours:{
                        $max:"$totalHours"
                    },

                    minHours:{
                        $min:"$totalHours"
                    }
                }
            }
        ])

        return res.status(200).json({
            success:true,
            data:data
        })

    }catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}