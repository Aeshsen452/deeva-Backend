const { Schema, model } = require("mongoose");


const vehicleSchema = new Schema({
    vehicleNumber: {
        type: String,
        trim: true,
        unique: true,
        required: true
    }
}, { timestamps: true });




const vehiclemodel = model("vehicle", vehicleSchema);

module.exports = vehiclemodel;