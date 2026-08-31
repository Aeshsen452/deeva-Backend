const routemodel = require("./route.model.js");
const { Err } = require("../../utils/errorHandling.js");




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
    const routes = await routemodel.find().sort({ _id: -1 });
    if (routes.length === 0) return res.status(204).json({ message: "no data found" });
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






module.exports = { addRoute, getRoute, deleteRoute, editRoute }