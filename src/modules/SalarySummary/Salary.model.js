const { Schema, model } = require("mongoose");

const SalarySchema = new Schema({
    extraDuty: {
        type: Number,
        default: 0
    },
    extraDiesel: {
        type: Number,
        default: 0
    },
    pf: {
        type: Number,
        default: 0
    },
    esic: {
        type: Number,
        default: 0,
    },
    advanced: {
        type: Number,
        default: 0
    },
    selectedDriver: {
        type: String,
        required: true

    },
    calender: {
        type: String,
        required: true
    }
}, { timestamps: true })

const salarymodel = model("SalarySummary", SalarySchema);


module.exports = salarymodel