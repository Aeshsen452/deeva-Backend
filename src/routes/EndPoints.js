const { Router } = require("express");
const routeRouter = require("../modules/route/route.routes");
const vehicleRouter = require("../modules/vehicle/vehicle.route");
const driverRouter = require("../modules/driver/driver.routes");
const tripRouter = require("../modules/Trip/trip.routes");
const dashBoardRouter = require("../modules/DashBoard/dash.routes")

const endPoint = Router();

endPoint.use("/route", routeRouter);
endPoint.use("/vehicle", vehicleRouter);
endPoint.use("/driver", driverRouter);
endPoint.use("/trip", tripRouter);
endPoint.use("/dash", dashBoardRouter);



module.exports = endPoint; 