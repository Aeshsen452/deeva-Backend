const routemodel = require("./route.model.js");
const { Err } = require("../../utils/errorHandling.js");
const path = require("path");
const XLSX = require("xlsx");
const fs = require("fs")

// add route 

const addRoute = Err(async (req, res) => {

    const { route, diesel, salary, incentive, latecharge } = req.body;

    if (!route || !diesel || !salary || !incentive || !latecharge) {
        return res.status(400).json({ message: "fields are  mandatory " })
    }

    const addingroute = new routemodel({ route, diesel, salary, incentive, latecharge });

    await addingroute.save();

    res.status(201).json({ message: "route added successfully", data: addingroute });

})

// get 

const getRoute = Err(async (req, res) => {
    const { search } = req.query;
    const query = {};

    if (search) {
        query.route = {
            $regex: search,
            $options: "i",
        };
    }


    const routes = await routemodel.find(query).sort({ _id: -1 });
    if (routes.length === 0) return res.status(204).json({ message: "no data found", data: [] });
    res.status(200).json({ message: "fetch successfully", data: routes })
})

// delete

const deleteRoute = Err(async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Bad Request" });
    const deletedData = await routemodel.findByIdAndDelete(id);
    res.status(201).json({ message: "Record Deleted successfully", data: deletedData });
})


const editRoute = Err(async (req, res) => {

    const data = req.body;
    const { _id } = data
    if (!_id) return res.status(400).json({ message: "Bad Request" });

    const fetchDataAndUpdate = await routemodel.findByIdAndUpdate(_id, data, { new: true });

    res.status(201).json({ message: "Data updated successfully", data: fetchDataAndUpdate })

})


const addExcel = Err(async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "file not found" });
    const FolderPath = path.join(process.cwd(), "ExcelFiles");

    const filePath = path.join(FolderPath, file.filename);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) return res.status(204).json({ message: "no data found in excel file to import" });

    try {
        const Bulkadd = await routemodel.insertMany(data, { ordered: false });
    } catch (error) {
        return res.status(400).json({ message: "Some data are duplicate which are not inserted into database please refresh the page to see the result " })
    }

    res.status(200).json({ message: "File extracted successfully data saves in database" })
    fs.unlinkSync(filePath);
})


module.exports = { addRoute, getRoute, deleteRoute, editRoute, addExcel }