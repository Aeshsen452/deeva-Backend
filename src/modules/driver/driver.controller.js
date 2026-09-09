const drivermodel = require("./driver.model");
const { Err } = require("../../utils/errorHandling")
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

const addDriver = Err(async (req, res) => {

    const { driverName, driverNumber } = req.body;

    if (!driverName || !driverNumber) return res.status(400).json({ message: "All fileds are required" });

    if (driverName.length > 30 || driverName.length < 3) return res.status(400).json({ message: "Driver Name invalid" })

    if (driverNumber.length > 10 || driverNumber.length < 10) return res.status(400).json({ message: "Invalid mobile" })

    const checkExisting = await drivermodel.countDocuments({ $or: [{ driverNumber }, { driverName }] });
    if (checkExisting) return res.status(400).json({ message: " Driver Name or Driver mobile number already exists" });

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

    const { search } = req.query;
    let query = {}

    if (search) {
        query.driverName = {
            $regex: search,
            $options: "i",
        };
    }

    const data = await drivermodel.find(query).sort({ _id: -1 });
    if (data.length === 0) return res.status(200).json({ message: "No data found", data: [] });
    res.status(200).json({ data })
})

const importExcelData = Err(async (req, res) => {

    const FolderPath = path.join(process.cwd(), "ExcelFiles");
    const filename = req?.file?.filename;
    if (!filename) return res.status(400).json({ message: "please upload an excel file" });
    const filePath = path.join(FolderPath, filename);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames;
    if (sheetName.length > 1) return res.status(400).json({ message: "please make a single sheet and upload again" })

    const worksheet = workbook.Sheets[sheetName[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
  
    const result = await drivermodel.insertMany(data, {
        ordered: false,
    });
    if (!result) return res.status(500).json({ message: "Something went wrong" })
    res.status(201).json({ message: "file extracted successfully" });

    //    Deleting the File from the Folder 

    fs.unlinkSync(filePath);


})


module.exports = { addDriver, getDrivers, deleteDriver, updateDriver, importExcelData }