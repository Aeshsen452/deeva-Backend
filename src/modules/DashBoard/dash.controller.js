const { Err } = require("../../utils/errorHandling")
const tripmodel = require("../Trip/trip.model");
const drivermodel = require("../driver/driver.model");


const GetDriverData = Err(async (req, res) => {
    const { driver, calender, search, skip, limit } = req.query;

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


    let Driverdata = []

    let total = 0;
    if (driver) {


        Driverdata = await tripmodel.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: {
                        vehicleNumber: "$vehicleNumber",
                        route: "$route"
                    },
                    TotalSalary: {
                        $sum: "$payroll.TotalSalary"
                    },
                    DieselUsed: {
                        $sum: {
                            $convert: {
                                input: "$DieselUsed",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    },

                    TotalTrip: {
                        $sum: 1
                    },
                    TripAmount: {
                        $first: "$payroll.tripSalary"
                    },
                    OnTimeIncentive: {
                        $first: "$payroll.TripIncentiveAmount"
                    },
                    OnLateCharge: {
                        $first: "$payroll.TripLateCharge"
                    },
                    Refund: {
                        $sum: {
                            $convert: {
                                input: "$refundedamount",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    },

                    totalOnTime: {
                        $sum: {
                            $cond: [
                                { $eq: ["$payroll.tripStatus", "Early"] },
                                1,
                                0
                            ]
                        }

                    },
                    totalLate: {
                        $sum: {
                            $cond: [
                                { $eq: ["$payroll.tripStatus", "Late"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.vehicleNumber",
                    routes: {
                        $push: {
                            route: "$_id.route",
                            TotalSalary: "$TotalSalary",
                            DieselUsed: "$DieselUsed",
                            TotalTrip: "$TotalTrip",
                            TripAmount: "$TripAmount",
                            OnTimeIncentive: "$OnTimeIncentive",
                            OnLateCharge: "$OnLateCharge",
                            Refund: "$Refund",
                            totalOnTime: "$totalOnTime",
                            totalLate: "$totalLate"
                        }
                    }
                }
            },

        ]);

    } else {

        Driverdata = await tripmodel.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: "$driverName",
                    TotalTrip: {
                        $sum: 1
                    },
                    TotalSalary: {
                        $sum: "$payroll.TotalSalary"
                    },
                    TotalVehicles: {
                        $addToSet: "$vehicleNumber"
                    },
                    TotalRoute: {
                        $addToSet: "$route"
                    },
                    Late: {
                        $sum: {
                            $cond: [
                                { $eq: ["$payroll.tripStatus", "Late"] },
                                1,
                                0
                            ]
                        }
                    },
                    OnTime: {
                        $sum: {
                            $cond: [
                                { $eq: ["$payroll.tripStatus", "Early"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $skip: Number(skip)
            },
            {
                $limit: Number(limit)
            },

        ])
        const totalDocument = await tripmodel.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    _id: "$driverName",
                }
            }
        ])
        total = totalDocument.length
    }

    res.status(200).json({ message: "ok", data: Driverdata, total })
})

const GetAllDriver = Err(async (req, res) => {
    const getAllData = await drivermodel.find({}, { driverName: true });
    res.status(200).json({ message: "ok", data: getAllData })
})



module.exports = { GetDriverData, GetAllDriver };