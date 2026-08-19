const { Router } = require("express");
const routeRouter = require("../modules/route/route.routes");

const endPoint = Router();

endPoint.use("/route", routeRouter)



module.exports = endPoint; 