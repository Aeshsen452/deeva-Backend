const { Err } = require("../../utils/errorHandling");
const routemodel = require("../route/route.model");
const tripmodel = require("./trip.model");




const CheckStatus = (d1, d2) => {

    if (!d1 || !d2) return;

    const { hours, Minutes } = d1;
    const { hours: hours2, Minutes: Minutes2 } = d2;

    const First = Number(hours) * 60 + Number(Minutes);
    const Second = Number(hours2) * 60 + Number(Minutes2);

    const diff = Second - First;

    let status = "";

    if (diff === 0) {
        status = "OnTime"
    } else if (diff > 0) {
        status = "Early"
    } else {
        status = "Late"
    }

    return status

}

const TimeDiffernce = (d1, d2) => {

    if (!d1 || !d2) return null;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const difference = date2 - date1;
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const Minutes = (difference % (60 * 60 * 1000)) / 60;
    return {
        hours,
        Minutes: Minutes / 1000
    }

}

const HoursDifference = (d1, d2, status) => {
    if (!d1 || !d2) return;
    const { hours, Minutes } = d1;
    const { hours: hours2, Minutes: Minutes2 } = d2;

    const First = Number(hours) * 60 + Number(Minutes);
    const Second = Number(hours2) * 60 + Number(Minutes2);

    const diff = status == "Early" ? (Second - First) : (First - Second);



    const hour = Math.floor(diff / 60)
    const minutes = (diff % 60);

    return {
        hour,
        minutes
    }
}

const Penaltly = (time, charge) => {
    const { hour, minutes } = time;
    let penalty = 0;

    if (hour < 1 && minutes > 0) {
        penalty += charge
    } else {
        penalty += (charge * hour);
        if (minutes > 0) {
            penalty += charge
        }
    }

    return penalty
}











const addTrip = Err(async (req, res) => {
    const {
        date,
        rps,
        driverName,
        vehicleNumber,
        route,
        dispatchTime,
        inTime,
        givenHour,
        givenMinutes,
        touchingPoint,
        unloadTime,
        loadTime,
        loadhour,
        loadminute,
        remark,
        refundedamount,
    } = req.body;
    const TripTimeData = TimeDiffernce(dispatchTime, inTime);
    if (!TripTimeData) return res.status(400).json({ message: "invalid date" });
    const obj = { hours: givenHour, Minutes: givenMinutes }
    const TripStatus = CheckStatus(TripTimeData, obj);
    const TripHoursDifference = HoursDifference(TripTimeData, obj, TripStatus);

    const { incentive, salary, latecharge } = await routemodel.findOne({ route }, { incentive: true, salary: true, latecharge: true });

    let penalty = 0;
    let increment = 0;

    if (TripStatus === "Early") {
        increment = incentive
    } else if (TripStatus === "Late") {
        penalty = Penaltly(TripHoursDifference, latecharge)
    }

    const Amount = (salary - penalty + increment + Number(refundedamount || 0));

    const payroll = {
        incentive: increment,
        penalty,
        tripTimeDifference: `${TripHoursDifference.hour}h : ${TripHoursDifference.minutes}m`,
        tripSalary: salary,
        TotalSalary: Amount,
        tripStatus: TripStatus,
        tripTimeTaken: `${TripTimeData.hours}h : ${TripTimeData.Minutes}m`

    };

    const BulkObj = {
        date,
        rps,
        driverName,
        vehicleNumber,
        route,
        dispatchTime,
        inTime,
        givenHour,
        givenMinutes
    };

    if (remark) {
        BulkObj.remark = remark
    }
    if (refundedamount) {
        BulkObj.refundedamount = refundedamount
    }

    if (touchingPoint) {
        BulkObj.touchingPoint = touchingPoint;
        BulkObj.unloadTime = unloadTime;
        BulkObj.loadTime = loadTime;

        const loadedTimeTaken = TimeDiffernce(unloadTime, loadTime);
        BulkObj.loadedTimeTaken = `${loadedTimeTaken.hours}h :${loadedTimeTaken.Minutes}m`;

        const loadobj = { hours: loadhour, Minutes: loadminute }
        const loadStatus = CheckStatus(loadedTimeTaken, loadobj);

        BulkObj.loadhour = loadhour;
        BulkObj.loadminute = loadminute;
        BulkObj.loadStatus = loadStatus;

        const loadedTimeDifference = HoursDifference(loadedTimeTaken, loadobj, loadStatus);

        BulkObj.loadedTimeDifference = `${loadedTimeDifference.hour}h :${loadedTimeDifference.minutes}m`;

    }

    BulkObj.payroll = payroll

    const addingTrip = new tripmodel(BulkObj);
    await addingTrip.save();

    res.status(200).json({ message: "Trip added successfully", data: addingTrip })

})

const getTrip = Err(async (req, res) => {

    const gettingAllTrips = await tripmodel.find().sort({ _id: -1 });

    if (gettingAllTrips.length === 0) return res.status(200).json({ message: "Fetched successfully", data: [] })

    res.status(200).json({ message: "Fetched successfully", data: gettingAllTrips })

})






module.exports = { addTrip, getTrip }