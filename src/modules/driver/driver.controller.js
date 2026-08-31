const drivermodel = require("./driver.model");
const { Err } = require("../../utils/errorHandling")

const addDriver = Err(async (req, res) => {

    const { driverName, driverNumber } = req.body;

    if (!driverName || !driverNumber) return res.status(400).json({ message: "All fileds are required" });

    if (driverNumber.length > 10 || driverNumber.length < 10) return res.status(400).json({ message: "Invalid mobile" })

    const checkExisting = await drivermodel.countDocuments({ driverNumber });
    if (checkExisting) return res.status(400).json({ message: "Mobile number already exists" });

    const adding = new drivermodel({ driverName, driverNumber });
    await adding.save();

    if (!adding) return res.status(500).json({ message: "driver added failed" });

    res.status(201).json({ message: "driver added successfully", data: adding })

})




const deleteDriver = Err(async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "bad request " });

    const deletingdriver = await drivermodel.findByIdAndDelete(id);

    if (!deletingdriver) return res.status(500).json({ message: "Failed to delete driver" });

    res.status(201).json({ message: "driver deleted successfully", data: deletingdriver });


})



const updateDriver = Err(async (req, res) => {
    const { _id, driverName, driverNumber } = req.body;

    if (!_id) return res.status(400).json({ message: "bad request" });

    const checkExistingdriverNumber = await drivermodel.countDocuments({
        _id: { $ne: _id },
        driverNumber
    })

    if (checkExistingdriverNumber) return res.status(400).json({ message: "Driver Number Already taken " })


    const updateDriverData = await drivermodel.findByIdAndUpdate(_id, { driverName, driverNumber }, { new: true });

    if (!updateDriverData) return res.status(500).json({ message: "updation failed" });

    res.status(201).json({ message: "Driver details updated successfully", data: updateDriverData });

})

const getDrivers = Err(async (req, res) => {

    const { search, currentPage, DataPerPage } = req.query;

    const skip = (Number(currentPage) - 1 || 0) * DataPerPage;
    let query = {}

    if (search) {
        query.vehicleNumber = {
            $regex: search,
            $options: "i",
        };
    }

    const Total = await drivermodel.countDocuments(query);
    const data = await drivermodel.find(query)
    // .limit(DataPerPage).skip(skip);
    if (data.length === 0) return res.status(200).json({ message: "No data found", data: [], Total: 0 });
    res.status(200).json({ data, Total })
})


module.exports = { addDriver, getDrivers, deleteDriver, updateDriver }