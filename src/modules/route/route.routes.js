const { Router } = require("express");
const { addRoute } = require("./route.controller.js")

const routeRouter = Router();

routeRouter.post("/", addRoute);


module.exports = routeRouter;