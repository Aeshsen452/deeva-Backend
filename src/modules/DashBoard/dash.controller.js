const { Err } = require("../../utils/errorHandling")


const GetDriverData = Err(async (req, res) => {
    const { driver, calender } = req.query;
    console.log({ driver, calender });
    res.status(200).json({ message: "ok" })
})



module.exports = { GetDriverData };