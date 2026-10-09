const { Err } = require("../../utils/errorHandling.js");
const salarymodel = require("../SalarySummary/Salary.model.js");


const createSummary = Err(async (req, res) => {
    const { calender, selectedDriver } = req.body;
    if (!selectedDriver || !calender) return res.status(400).json({ message: "DriverName or Month not Selected" });
    await salarymodel.create(req.body);

    res.status(201).json({ message: "Saved Successfully" })

})

const getSummary = Err(async (req, res) => {

    const { driverName, Calender } = req.query;

    let query = {
        $and: [
            { selectedDriver: driverName },
            { calender: Calender },
        ]
    }
    const Data = await salarymodel.findOne(query, { createdAt: 0, updatedAt: 0, __v: 0, calender: 0, selectedDriver: 0 });

    res.status(200).json({ message: "fetch Successfully", data: Data })

})

const updateSummary = Err(async (req, res) => {

    const { _id } = req.body;

    if (!_id) return res.status(400).json({ message: "Id not found" });


    const updatingData = await salarymodel.findByIdAndUpdate(_id, req.body);

    if (!updatingData) return res.status(500), json({ message: "updation Failed" });


    res.status(201).json({ message: "updated successfully" });
})

module.exports = { createSummary, getSummary, updateSummary }