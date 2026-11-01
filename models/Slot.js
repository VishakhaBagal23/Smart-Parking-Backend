const mongoose = require('mongoose')

const slotSchema = new mongoose.Schema({

    slotNumber:{
        type:String,
        unique:true
    },
    
    floor:{
        type:Number
    },

    slotType:{
        type:String,
        enum:['BIKE','CAR','TRUCK']
    },
    status:{
    type:String,
    enum:['AVAILABLE','OCCUPIED'],
    default: "AVAILABLE"

    }



},{timestamps:true})

slotSchema.index({
    slotType:1,
    status:1
})

// ✔ FIX: prevents OverwriteModelError in development
module.exports = mongoose.models.Slot || mongoose.model('Slot', slotSchema)