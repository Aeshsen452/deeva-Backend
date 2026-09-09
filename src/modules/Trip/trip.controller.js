const { Err } = require("../../utils/errorHandling");
const routemodel = require("../route/route.model");
const tripmodel = require("./trip.model");
const xlsx = require("xlsx");
const path = require("path");


// Helper Functions 

// checking that dates are correct or not 

const checkingDate = (t1, t2) => {

    if (!t1 || !t2) return false;

    const date1 = new Date(t1);
    const date2 = new Date(t2);

    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        return false;
    }

    if (date1 > date2) return false;

    return true
}




// Step 1 
const calculatingTimeTaken = (d1, d2) => {

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

// step 2

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

// step 3
const calculatingTimeDifference = (d1, d2, status) => {
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

// step 4  // this function will return total time taken , status , time differnce 

const Timefn = (T1, T2, Hour, Minute) => {

    const TimeTaken = calculatingTimeTaken(T1, T2);
    const obj = { hours: Hour, Minutes: Minute }
    const Status = CheckStatus(TimeTaken, obj);
    const TimeDifference = calculatingTimeDifference(TimeTaken, obj, Status);


    return {
        TimeTaken, Status, TimeDifference
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

const CreatingPayload = async (route, object, refundedamount) => {

    const { TimeTaken, Status, TimeDifference } = object

    let penalty = 0;
    let increment = 0;
    let refund = Status === "Late" ? Number(refundedamount) : 0
    const { incentive, salary, latecharge } = await routemodel.findOne({ route }, { incentive: true, salary: true, latecharge: true });

    if (Status === "Early") {
        increment = incentive
    } else if (Status === "Late") {
        penalty = Penaltly(TimeDifference, latecharge)
    }

    const Amount = (salary - penalty + increment + refund);

    const payroll = {
        incentive: increment,
        penalty,
        tripTimeDifference: `${TimeDifference.hour}h : ${TimeDifference.minutes}m`,
        tripSalary: salary,
        TotalSalary: Amount,
        tripStatus: Status,
        tripTimeTaken: `${TimeTaken.hours}h : ${TimeTaken.Minutes}m`

    };

    return payroll

}


const checkExcelFormate = (arr2) => {

    const arr1 = ['date', 'rps', 'driverName', 'vehicleNumber', 'route', 'dispatchTime', 'inTime', 'givenHour', 'givenMinutes', 'touchingPoint', 'unloadTime', 'loadTime', 'loadhour', 'loadminute', 'remark', 'refundedamount'];

    if (JSON.stringify(arr1) !== JSON.stringify(arr2)) return false;
    return true
}


const CreatingImportPayload = async (route, object, refundedamount) => {

    const { TimeTaken, Status, TimeDifference } = object

    let penalty = 0;
    let increment = 0;
    let refund = Status === "Late" ? Number(refundedamount) : 0
    const { incentive, salary, latecharge } = route;

    if (Status === "Early") {
        increment = incentive
    } else if (Status === "Late") {
        penalty = Penaltly(TimeDifference, latecharge)
    }

    const Amount = (salary - penalty + increment + refund);

    const payroll = {
        incentive: increment,
        penalty,
        tripTimeDifference: `${TimeDifference.hour}h : ${TimeDifference.minutes}m`,
        tripSalary: salary,
        TotalSalary: Amount,
        tripStatus: Status,
        tripTimeTaken: `${TimeTaken.hours}h : ${TimeTaken.Minutes}m`

    };

    return payroll

}








// rest apis 

// -------------------------------------------------------------

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
        refundedamount,
    } = req.body;


    if (!date || !rps || !driverName || !vehicleNumber || !route || !dispatchTime || !inTime || !givenHour || !givenMinutes) return res.status(400).json({ message: "All fields are mandatory" })


    const verifyDate = checkingDate(dispatchTime, inTime);

    if (!verifyDate) return res.status(400).json({ message: "Invalid dispatchTime or inTime Date" });

    // calculating TimeDifference in hours and minute

    const BulkObj = { ...req.body }

    const Time_StatusData = Timefn(dispatchTime, inTime, givenHour, givenMinutes);
    const payroll = await CreatingPayload(route, Time_StatusData, refundedamount);

    BulkObj.payroll = payroll


    if (touchingPoint) {

        const verifyTouchingDates = checkingDate(unloadTime, loadTime);

        if (!verifyTouchingDates) return res.status(400).json({ message: "invalid Touching points unloadTime or loadTime dates" })

        const { TimeTaken: TouchingPointTimeTaken, Status: TouchingPointStatus, TimeDifference: TouchingPointTimeDifference } = Timefn(unloadTime, loadTime, loadhour, loadminute)

        BulkObj.loadedTimeTaken = `${TouchingPointTimeTaken.hours}h :${TouchingPointTimeTaken.Minutes}m`;
        BulkObj.loadStatus = TouchingPointStatus;
        BulkObj.loadedTimeDifference = `${TouchingPointTimeDifference.hour}h :${TouchingPointTimeDifference.minutes}m`;

    }

    const addingTrip = new tripmodel(BulkObj);
    await addingTrip.save();

    res.status(200).json({ message: "Trip added successfully" })

})


const getTrip = Err(async (req, res) => {
    const { search } = req.query;

    const query = {};

    if (search) {
        query.rps = {
            $regex: search,
            $options: "i"
        }
    }

    const gettingAllTrips = await tripmodel.find(query).sort({ _id: -1 });

    if (gettingAllTrips.length === 0) return res.status(200).json({ message: "Fetched successfully", data: [] })

    res.status(200).json({ message: "Fetched successfully", data: gettingAllTrips })

})


const deleteTrip = Err(async (req, res) => {
    const { deleteId } = req.params;

    if (!deleteId) return res.status(400).json({ message: "Bad request" });

    const deleteData = await tripmodel.findByIdAndDelete(deleteId);
    if (!deleteData) return res.status(500).json({ message: "something went wrong" });

    res.status(200).json({ message: "Data deleted successfully" })

})


const updateData = Err(async (req, res) => {

    const {
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
        refundedamount,
        rps,
        _id


    } = req.body;

    if (!_id) return res.status(400).json({ message: "bad request" });


    // fetching rps number id already exist then don't allow to enter 

    const fetchingExistingRps = await tripmodel.countDocuments({ rps, _id: { $ne: _id } });

    if (fetchingExistingRps > 0) return res.status(400).json({ message: "Rps number already exist" });


    const verifyDate = checkingDate(dispatchTime, inTime);

    if (!verifyDate) return res.status(400).json({ message: "Invalid dispatchTime or inTime Date" });


    const Time_StatusData = Timefn(dispatchTime, inTime, givenHour, givenMinutes);
    const payroll = await CreatingPayload(route, Time_StatusData, refundedamount);

    const BulkObj = { ...req.body };

    BulkObj.payroll = payroll

    if (touchingPoint) {
        const verifyTouchingDates = checkingDate(unloadTime, loadTime);

        if (!verifyTouchingDates) return res.status(400).json({ message: "invalid Touching points unloadTime or loadTime dates" })

        const { TimeTaken: TouchingPointTimeTaken, Status: TouchingPointStatus, TimeDifference: TouchingPointTimeDifference } = Timefn(unloadTime, loadTime, loadhour, loadminute)

        BulkObj.loadedTimeTaken = `${TouchingPointTimeTaken.hours}h :${TouchingPointTimeTaken.Minutes}m`;

        BulkObj.loadStatus = TouchingPointStatus;

        BulkObj.loadedTimeDifference = `${TouchingPointTimeDifference.hour}h :${TouchingPointTimeDifference.minutes}m`;
    }


    await tripmodel.findByIdAndUpdate(_id, BulkObj, { new: true })

    res.status(201).json({ message: "Trip updated successfully" })

})


// convert excel date to html 
function excelDateToHTMLDate(serial) {
    const date = new Date(Date.UTC(1899, 11, 30));
    date.setUTCDate(date.getUTCDate() + Number(serial));

    return date.toISOString().split('T')[0];
}

const checkDateTimeFormat = (date) => {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    return regex.test(date)
}



const bulkTrip = Err(async (req, res) => {

    const file = req.file.filename;
    if (!file) return res.status(400).json({ message: "please upload file" });
    const folderPath = path.join(process.cwd(), "ExcelFiles");

    const filePath = path.join(folderPath, file);


    const workbook = xlsx.readFile(filePath);

    const sheetName = workbook.SheetNames;
    if (sheetName.length > 1) return res.status(400).json({ message: "please make a single sheet and upload again" })

    const worksheet = workbook.Sheets[sheetName[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    console.log(data)

    const headings = Object.keys(data[0]);


    const verifyFormat = checkExcelFormate(headings);
    if (!verifyFormat) return res.status(400).json({ message: "this format not supported" });


    const GetAllRoutes = await routemodel.find();

    const filteringData = data.filter((item) => GetAllRoutes.some((r) => r.route === item.route));

    const BulkData = [];

    for (let i = 0; i < filteringData; i++) {

        const { date, dispatchTime, inTime, givenHour, givenMinutes, touchingPoint, unloadTime, loadTime, loadhour, loadminute, refundedamount, route } = filteringData[i];

        if (!checkDateTimeFormat(dispatchTime)) continue
        if (!checkDateTimeFormat(inTime)) continue

        if (touchingPoint) {
            if (!checkDateTimeFormat(unloadTime)) continue
            if (!checkDateTimeFormat(loadTime)) continue
        }

        const verifyDate = checkingDate(dispatchTime, inTime);

        if (!verifyDate) continue;

        const BulkObj = { ...filteringData[i], date: excelDateToHTMLDate(date) }

        const Time_StatusData = Timefn(dispatchTime, inTime, givenHour, givenMinutes);

        const fetchingRoutes = GetAllRoutes.filter((r) => r.route === route)

        const payroll = CreatingImportPayload(fetchingRoutes, Time_StatusData, refundedamount);

        BulkObj.payroll = payroll

        if (touchingPoint) {

            const verifyTouchingDates = checkingDate(unloadTime, loadTime);

            if (!verifyTouchingDates) continue

            const { TimeTaken: TouchingPointTimeTaken, Status: TouchingPointStatus, TimeDifference: TouchingPointTimeDifference } = Timefn(unloadTime, loadTime, loadhour, loadminute)

            BulkObj.loadedTimeTaken = `${TouchingPointTimeTaken.hours}h :${TouchingPointTimeTaken.Minutes}m`;
            BulkObj.loadStatus = TouchingPointStatus;
            BulkObj.loadedTimeDifference = `${TouchingPointTimeDifference.hour}h :${TouchingPointTimeDifference.minutes}m`;

        }


        BulkData.push(BulkObj)

    }

    await tripmodel.insertMany(BulkData);

    res.status(201).json({ message: "Data which are correct that are inserted...." })


})




module.exports = { addTrip, getTrip, deleteTrip, updateData, bulkTrip }