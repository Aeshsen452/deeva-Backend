const vehiclemodel = require("./vehicle.model");
const XLSX = require("xlsx");
const { Err } = require("../../utils/errorHandling");
const path = require("path");


const addVehicle = Err(async (req, res) => {

    const { vehicleNumber } = req.body;
    if (!vehicleNumber) return res.status(400).json({ message: "Vehicle Number is required" });

    const checkExisting = await vehiclemodel.countDocuments({ vehicleNumber });

    if (checkExisting > 0) return res.status(409).json({ message: "Vechile Number is already registered in database" });


    const addingVehicle = new vehiclemodel({
        vehicleNumber
    });

    await addingVehicle.save();

    return res.status(201).json({ message: "vehicle added successfully", data: addingVehicle });

})

const importExcelFile = Err(async (req, res) => {



    const file = req?.file;
    if (!file) return res.status(400).json({ message: "please upload an excel file" });
    const fileName = file.filename;

    const filePath = path.join(process.cwd(), "ExcelFiles", fileName)

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) return res.status(204).json({ message: "no data found in excel file to import" });


    if (!(Object.keys(data[0])[0] === "vehicleNumber")) return res.status(400).json({ message: "File data missmatched please correct the heading name." });



    const Bulkadd = await vehiclemodel.insertMany(data);


    res.status(200).json({ message: "File extracted successfully data saves in database", data: Bulkadd })


})

const deleteVehicle = Err(async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "bad request " });

    const deletevehicle = await vehiclemodel.findByIdAndDelete(id);

    if (!deletevehicle) return res.status(500).json({ message: "Failed to delete vehicle" });

    res.status(201).json({ message: "vehicle deleted successfully", data: deletevehicle });


})



const updateVehicle = Err(async (req, res) => {
    const { _id, vehicleNumber } = req.body;

    if (!_id || !vehicleNumber) return res.status(400).json({ message: "bad request" });

    const updateVehicleData = await vehiclemodel.findByIdAndUpdate(_id, { vehicleNumber }, { new: true });

    if (!updateVehicleData) return res.status(500).json({ message: "updation failed" });

    res.status(201).json({ message: "vehicle updated successfully", data: updateVehicleData });

})

const getVehicle = Err(async (req, res) => {

    const { search, currentPage, DataPerPage } = req.query;



    const skip = (Number(currentPage) - 1 || 0) * DataPerPage;
    let query = {}

    if (search) {
        query.vehicleNumber = {
            $regex: search,
            $options: "i",
        };
    }

    const Total = await vehiclemodel.countDocuments(query);
    const data = await vehiclemodel.find(query).limit(DataPerPage).skip(skip);
    if (data.length === 0) return res.status(200).json({ message: "No data found", data: [], Total: 0 });
    res.status(200).json({ data, Total })
})




module.exports = { addVehicle, importExcelFile, deleteVehicle, updateVehicle, getVehicle }