const { model, Schema } = require("mongoose");
const routeSchema = new Schema({
    route: {
        type: String,
        trim: true,
        required: true
    },
    diesel: {
        type: Number,
        required: true,
    },
    salary: {
        type: Number,
        required: true
    },
    incentive: {
        type: Number,
        required: true
    },
    latecharge: {
        type: Number,
        required: true
    }

}, { timestamps: true });

const routemodel = model("route", routeSchema);

module.exports = routemodel

