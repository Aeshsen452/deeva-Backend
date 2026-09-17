const { Err } = require("../../utils/errorHandling")
const tripmodel = require("../Trip/trip.model")


const GetDriverData = Err(async (req, res) => {
    const { driver, calender } = req.query;

    const query = {}

    // if (calender) {

    //     const [year, monthNumber] = calender.split("-");

    //     const startDate = `${year}-${monthNumber}-01`;

    //     // Next month
    //     const nextMonth = new Date(
    //         Number(year),
    //         Number(monthNumber),
    //         1
    //     );
    //     const endDate =
    //         `${nextMonth.getFullYear()}-${String(
    //             nextMonth.getMonth() + 1
    //         ).padStart(2, "0")}-01`;

    //     query.date = {
    //         $gte: startDate,
    //         $lt: endDate
    //     }
    // }

    if (driver) {
        query.driverName = {
            $regex: driver,
            $options: "i"
        }
    }

    console.log(query)

    const tripData = await tripmodel.find(query);



    if (driver) {
        const Driverdata = tripData.reduce((acc, current) => {

            const route = current.route;
            const vehicles = current.vehicleNumber;

            if (!acc[vehicles]) {
                acc[vehicles] = {
                    data: {}
                };
            }

            if (!acc[vehicles].data[route]) {
                acc[vehicles].data[route] = {
                    Salary: 0,
                    Salary_Deducted: 0,
                    On_Time: 0,
                    Late: 0,

                }
            }

            

            acc[vehicles].data.push(current);

            return acc;

        }, {})

        console.log(Driverdata)

    }

    // console.log(tripData)

    res.status(200).json({ message: "ok", data: tripData })
})



module.exports = { GetDriverData };