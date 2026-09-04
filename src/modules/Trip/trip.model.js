const { Schema, model } = require("mongoose");


const tripSchema = new Schema({
    date: {
        type: String,
        required: [true, "Date is required"],
        trim: true
    },
    rps: {
        type: String,
        unique: true,
        trim: true,
        required: [true, "rps number is required"],
        minlength: [6, "invalid rps number"]
    },
    driverName: {
        type: String,
        required: [true, "driver name is required"],
        trim: true,
    },
    vehicleNumber: {
        type: String,
        required: [true, "vehicle number is required"],
        trim: true
    },
    route: {
        type: String,
        required: [true, "route is required"],
        trim: true
    },
    dispatchTime: {
        type: String,
        required: [true, "dispatch time is required"]
    },
    inTime: {
        type: String,
        required: [true, "in time is required"]
    },
    givenHour: {
        type: String,
        required: [true, "given hour is required"],
    },
    givenMinutes: {
        type: String,
        required: [true, "given minutes is required"],
    },


    touchingPoint: {
        type: String,
    },
    unloadTime: {
        type: String,
    },

    loadTime: {
        type: String,
    },

    loadhour: {
        type: String,
    },

    loadminute: {
        type: String,
    },


    remark: {
        type: String,
    },
    refundedamount: {
        type: String,
    },
    loadStatus: {
        type: String,
        enum: ["Early", "OnTime", "Late"],
    },
    loadedTimeTaken: {
        type: String
    },
    loadedTimeDifference: {
        type: String
    },
    payroll: {
        incentive: {
            type: Number,
            default: 0
        },
        penalty: {
            type: Number,
            default: 0
        },

        tripStatus: {
            type: String,
            enum: ["Early", "OnTime", "Late"],
            required: [true, "trip status is required"]
        },
        tripTimeTaken: {
            type: String,
            required: [true, "Time taken is required"],

        },
        tripTimeDifference: {
            type: String,
            required: true,
        },


        tripSalary: {
            type: Number,
            required: true
        },
        TotalSalary: {
            type: Number,
            required: true
        }
    },

})

const tripmodel = model("trip", tripSchema);

module.exports = tripmodel