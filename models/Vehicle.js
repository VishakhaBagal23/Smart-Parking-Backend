const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
    vehicleNumber:{
        type:String,
        required:true,
        unique:true,
        uppercase:true
    },
    ownerName:{
        type:String,
        required:true,
    },

     mobileNo:{
        type:String,
        required:true,
    },

    vehicleType:{
        type:String,
        enum:['BIKE','CAR','TRUCK']
    }
},{
    timestamps:true

})

// ✔ FIX: prevents OverwriteModelError in development
module.exports = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema)