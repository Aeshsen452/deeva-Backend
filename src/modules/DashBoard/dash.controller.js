const { Err } = require("../../utils/errorHandling")
const tripmodel = require("../Trip/trip.model")


const GetDriverData = Err(async (req, res) => {
    const { driver, calender, search } = req.query;

    const query = {}

    if (search) {
        query.$or = [
            { driverName: { $regex: search, $options: "i" } },
        ]
    }

    if (calender) {

        const [year, monthNumber] = calender.split("-");

        const startDate = `${year}-${monthNumber}-01`;

        // Next month
        const nextMonth = new Date(
            Number(year),
            Number(monthNumber),
            1
        );
        const endDate =
            `${nextMonth.getFullYear()}-${String(
                nextMonth.getMonth() + 1
            ).padStart(2, "0")}-01`;

        query.date = {
            $gte: startDate,
            $lt: endDate
        }
    }

    if (driver) {
        query.driverName = {
            $regex: driver,
            $options: "i"
        }
    }


    const tripData = await tripmodel.find(query);

    if (tripData.length == 0) return res.status(200).json({ message: "fetched", data: tripData })


    let Driverdata = tripData

    if (driver) {
        const filteringData = tripData.reduce((acc, current) => {

            const route = current.route;
            const vehicle = current.vehicleNumber;

            // Invalid data skip
            if (!route || !vehicle) {
                return acc;
            }

            // Vehicle initialize
            if (!acc[vehicle]) {
                acc[vehicle] = {
                    data: {}
                };
            }

            // Route initialize
            if (!acc[vehicle].data[route]) {
                acc[vehicle].data[route] = {
                    Salary: 0,
                    Salary_Deducted: 0,
                    On_Time: 0,
                    Late: 0,
                    Early: 0,
                    rps: 0,
                    TripAmount: 0,
                    IncentiveAmount: 0,
                    LateAmount: 0,
                    refund: 0,
                    Diesel : 0,
                    
                };
            }


            if (!acc[vehicle].data[route].TripAmount) {
                acc[vehicle].data[route].TripAmount = current.payroll?.tripSalary || 0;
            }

            if (!acc[vehicle].data[route].IncentiveAmount) {
                acc[vehicle].data[route].IncentiveAmount = current.payroll?.TripIncentiveAmount || 0;
            }

            if (!acc[vehicle].data[route].LateAmount) {
                acc[vehicle].data[route].LateAmount = current.payroll?.TripLateCharge || 0;
            }



            const routeData = acc[vehicle].data[route];

            // Salary
            routeData.Salary += Number(
                current.payroll?.TotalSalary || 0
            );

            routeData.refund += Number(
                current.refundedamount || 0
            );

             routeData.Diesel += Number(
                current.DieselUsed || 0
            );



            // Penalty
            routeData.Salary_Deducted += Number(
                current.payroll?.penalty || 0
            );




            // Status
            const status = current.payroll?.tripStatus;

            if (status === "Late") {
                routeData.Late++;
            }
            else if (status === "Early") {
                routeData.Early++;
            }
            else {
                routeData.On_Time++;
            }

            // RPS
            routeData.rps++;

            return acc;

        }, {});

        // Driverdata = Object.values(filteringData)

        Driverdata = Object.entries(filteringData).map(([key, value]) => ({
            key,
            ...value
        }));

    } else {
        const newData = tripData.reduce((acc, current) => {
            const { driverName, vehicleNumber, route } = current;

            if (!acc[driverName]) {
                acc[driverName] = {
                    TotalRps: 0,
                    TotalSalary: 0,
                    OnTime: 0,
                    Late: 0,
                    Early: 0,
                    Route: [],
                    Vehicles: [],
                    driverName: ""
                }
            }

            if (!acc[driverName][driverName]) {
                acc[driverName].driverName = driverName;
            }

            acc[driverName].TotalSalary += Number(
                current.payroll?.TotalSalary || 0
            );

            acc[driverName].TotalRps++;

            const status = current.payroll?.tripStatus;

            if (status === "Late") {
                acc[driverName].Late++;
            } else if (status === "Early") {
                acc[driverName].Early++;
            } else {
                acc[driverName].OnTime++;
            }

            if (route && !acc[driverName].Route.includes(route)) {
                acc[driverName].Route.push(route);
            }

            if (vehicleNumber && !acc[driverName].Vehicles.includes(vehicleNumber)) {
                acc[driverName].Vehicles.push(vehicleNumber);
            }

            return acc;

        }, {})
        Driverdata = Object.values(newData);
    }

    res.status(200).json({ message: "ok", data: Driverdata })
})



module.exports = { GetDriverData };