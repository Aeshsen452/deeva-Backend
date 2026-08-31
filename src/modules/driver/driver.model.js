const { Schema, model } = require("mongoose");


const driverSchema = new Schema({
    driverName: {
        type: String,
        trim: true,
        required: true
    },
    driverNumber: {
        type: String,
        trim: true,
        maxLenght: 10,
        minLength: true,
        unique: [true, "mobile number already exists"]

    }
}, { timestamps: true });




const drivermodel = model("driver", driverSchema);

module.exports = drivermodel;