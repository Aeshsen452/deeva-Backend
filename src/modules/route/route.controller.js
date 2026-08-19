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

    res.status(201).json({ message: "route added successfully" });

})


module.exports = { addRoute }