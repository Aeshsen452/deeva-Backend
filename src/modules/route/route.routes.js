const { Router } = require("express");
const { addRoute, getRoute, deleteRoute, editRoute } = require("./route.controller.js")

const routeRouter = Router();

routeRouter.post("/", addRoute);
routeRouter.get("/", getRoute);
routeRouter.delete("/:id", deleteRoute)
routeRouter.patch("/", editRoute)


module.exports = routeRouter;