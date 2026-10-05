const { Err } = require("../../utils/errorHandling");
const routemodel = require("../route/route.model");
const tripmodel = require("./trip.model");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs")


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

const CreatingPayload = (route, object, refundedamount) => {

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
        tripTimeTaken: `${TimeTaken.hours}h : ${TimeTaken.Minutes}m`,
        TripLateCharge: latecharge,
        TripIncentiveAmount: incentive

    };

    return payroll

}


const checkExcelFormate = (arr2) => {

    const arr1 = ['date', 'rps', 'driverName', 'vehicleNumber', 'route', 'dispatchTime', 'inTime', 'givenHour', 'givenMinutes', 'touchingPoint', 'unloadTime', 'loadTime', 'loadhour', 'loadminute', 'refundedamount'];

    if (JSON.stringify(arr1) !== JSON.stringify(arr2)) return false;
    return true
}


const CreatingImportPayload = (route, object, refundedamount) => {

    const { TimeTaken, Status, TimeDifference } = object

    let penalty = 0;
    let increment = 0;
    let refund = Status === "Late" ? Number(refundedamount) || 0 : 0
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
        tripTimeTaken: `${TimeTaken.hours}h : ${TimeTaken.Minutes}m`,
        TripLateCharge: latecharge,
        TripIncentiveAmount: incentive
    };

    return payroll

}


// convert excel date to html

function excelDateToHTMLDate(excelTimestamp) {
    // 1. Guard against null, undefined, empty strings, or non-numeric inputs
    if (excelTimestamp === null || excelTimestamp === undefined || excelTimestamp === '') {
        return ''; // Return an empty string or null depending on your database schema
    }

    // 2. Cast input to a number
    const serial = Number(excelTimestamp);

    // 3. Ensure it's a valid number
    if (isNaN(serial)) {
        return '';
    }

    // 4. Perform Excel to Unix conversion
    const dateObj = new Date((serial - 25569) * 86400 * 1000);

    // 5. Check if the generated Date object is valid before calling .toISOString()
    if (isNaN(dateObj.getTime())) {
        return '';
    }

    const ForamtedDate = dateObj.toISOString().split('T')[0];
    const [year, day, month] = ForamtedDate.split('-');
    return `${year}-${month}-${day}`;
}

const convertHtmlDate = (date) => {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`;
}


// check That time is correct or not  
const checkDateTimeFormat = (date) => {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    return regex.test(date)
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
    const RouteData = await routemodel.findOne({ route }, { incentive: true, salary: true, latecharge: true, diesel: true })
    const payroll = CreatingPayload(RouteData, Time_StatusData, refundedamount);

    BulkObj.DieselUsed = RouteData.diesel
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
    const { search, skip, limit } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            {
                rps: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                driverName: {
                    $regex: search,
                    $options: "i"
                }
            },


        ]
    }

    const total = await tripmodel.countDocuments(query)
    const gettingAllTrips = await tripmodel.find(query).sort({ _id: -1 }).skip(skip).limit(limit);

    if (gettingAllTrips.length === 0) return res.status(200).json({ message: "Fetched successfully", data: [] })

    res.status(200).json({ message: "Fetched successfully", data: gettingAllTrips, total })

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

    const verifyDate = checkingDate(dispatchTime, inTime);

    if (!verifyDate) return res.status(400).json({ message: "Invalid dispatchTime or inTime Date" });


    const Time_StatusData = Timefn(dispatchTime, inTime, givenHour, givenMinutes);

    const RouteData = await routemodel.findOne({ route }, { incentive: true, salary: true, latecharge: true, diesel: true })

    const payroll = CreatingPayload(RouteData, Time_StatusData, refundedamount);

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


    const GetAllRoutes = await routemodel.find({}, { incentive: true, salary: true, latecharge: true, diesel: true, route: true });

    const filteringData = data.filter((item) => GetAllRoutes.some((r) => r.route === item.route));

    const BulkData = [];

    for (let i = 0; i < filteringData.length; i++) {


        const { date, dispatchTime, inTime, givenHour, givenMinutes, touchingPoint, unloadTime, loadTime, loadhour, loadminute, refundedamount, route } = filteringData[i];


        if (!checkDateTimeFormat(dispatchTime)) continue
        if (!checkDateTimeFormat(inTime)) continue

        if (touchingPoint) {
            if (!checkDateTimeFormat(unloadTime)) continue
            if (!checkDateTimeFormat(loadTime)) continue
        }



        const verifyDate = checkingDate(dispatchTime, inTime);

        if (!verifyDate) continue;

        const BulkObj = {
            ...filteringData[i],
            date: excelDateToHTMLDate(date) ? excelDateToHTMLDate(date) : convertHtmlDate(date)
        }

        const Time_StatusData = Timefn(dispatchTime, inTime, givenHour, givenMinutes);

        const fetchingRoutes = GetAllRoutes.find((r) => r.route === route);


        const payroll = CreatingImportPayload(fetchingRoutes, Time_StatusData, refundedamount);

        BulkObj.payroll = payroll
        BulkObj.DieselUsed = fetchingRoutes.diesel

        if (touchingPoint) {

            const verifyTouchingDates = checkingDate(unloadTime, loadTime);

            if (!verifyTouchingDates) continue

            const { TimeTaken: TouchingPointTimeTaken, Status: TouchingPointStatus, TimeDifference: TouchingPointTimeDifference } = Timefn(unloadTime, loadTime, loadhour, loadminute)

            BulkObj.loadedTimeTaken = `${TouchingPointTimeTaken.hours}h :${TouchingPointTimeTaken.Minutes}m`;
            BulkObj.loadStatus = TouchingPointStatus;
            BulkObj.loadedTimeDifference = `${TouchingPointTimeDifference.hour}h :${TouchingPointTimeDifference.minutes}m`;

        }


        BulkData.push(BulkObj);
    }
    try {
        await tripmodel.insertMany(BulkData, { ordered: false });
    } catch (error) {

        return res.status(400).json({ message: "Some duplicates rps number found  " })
    }

    res.status(201).json({ message: "Data which are correct that are inserted...." })

})

const exportExcel = Err(async (req, res) => {

    const allTrip = await tripmodel.find({}, { _id: false, __v: false, createdAt: false, updatedAt: false });

    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Routes");
        worksheet.columns = [
            { header: "date", key: "date" },
            { header: "rps", key: "rps" },
            { header: "driverName", key: "driverName" },
            { header: "vehicleNumber", key: "vehicleNumber" },
            { header: "route", key: "route" },
            { header: "dispatchTime", key: "dispatchTime" },
            { header: "inTime", key: "inTime" },
            { header: "givenHour", key: "givenHour" },
            { header: "givenMinutes", key: "givenMinutes" },
            { header: "touchingPoint", key: "touchingPoint" },
            { header: "unloadTime", key: "unloadTime" },
            { header: "loadTime", key: "loadTime" },
            { header: "loadhour", key: "loadhour" },
            { header: "loadminute", key: "loadminute" },
            { header: "remark", key: "remark" },
            { header: "loadStatus", key: "loadStatus" },
            { header: "loadedTimeTaken", key: "loadedTimeTaken" },
            { header: "loadedTimeDifference", key: "loadedTimeDifference" },
            { header: "DieselUsed", key: "DieselUsed" },
            { header: "incentive", key: "incentive" },
            { header: "penalty", key: "penalty" },
            { header: "tripStatus", key: "tripStatus" },
            { header: "tripTimeTaken", key: "tripTimeTaken" },
            { header: "tripTimeDifference", key: "tripTimeDifference" },
            { header: "tripSalary", key: "tripSalary" },
            { header: "TotalSalary", key: "TotalSalary" },
            { header: "TripLateCharge", key: "TripLateCharge" },
            { header: "TripIncentiveAmount", key: "TripIncentiveAmount" }
        ];


        const TripFormatData = allTrip.map((route) => {
            const payroll = route.payroll || {};

            return {
                date: route.date || "",
                rps: route.rps || "",
                driverName: route.driverName || "",
                vehicleNumber: route.vehicleNumber || "",
                route: route.route || "",
                dispatchTime: route.dispatchTime || "",
                inTime: route.inTime || "",
                givenHour: route.givenHour || "",
                givenMinutes: route.givenMinutes || "",
                touchingPoint: route.touchingPoint || "",
                unloadTime: route.unloadTime || "",
                loadTime: route.loadTime || "",
                loadhour: route.loadhour || "",
                loadminute: route.loadminute || "",
                remark: route.remark || "",
                loadStatus: route.loadStatus || "",
                loadedTimeTaken: route.loadedTimeTaken || "",
                loadedTimeDifference: route.loadedTimeDifference || "",
                DieselUsed: route.DieselUsed || 0,

                incentive: payroll.incentive || 0,
                penalty: payroll.penalty || 0,
                tripStatus: payroll.tripStatus || "",
                tripTimeTaken: payroll.tripTimeTaken || "",
                tripTimeDifference: payroll.tripTimeDifference || "",
                tripSalary: payroll.tripSalary || 0,
                TotalSalary: payroll.TotalSalary || 0,
                TripLateCharge: payroll.TripLateCharge || 0,
                TripIncentiveAmount: payroll.TripIncentiveAmount || 0
            };
        });

        worksheet.addRows(TripFormatData);

        // Write Excel file
        await workbook.xlsx.writeFile("trip.xlsx");
        res.download("trip.xlsx", "trip.xlsx");
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to generate Excel file",
        });
    }

})




module.exports = { addTrip, getTrip, deleteTrip, updateData, bulkTrip, exportExcel }