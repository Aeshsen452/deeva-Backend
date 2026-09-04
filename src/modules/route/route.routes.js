const { Router } = require("express");
const { addRoute, getRoute, deleteRoute, editRoute, addExcel } = require("./route.controller.js")
const upload = require("../../middlewares/multer.js");

const routeRouter = Router();

routeRouter.post("/", addRoute);
routeRouter.get("/", getRoute);
routeRouter.delete("/:id", deleteRoute)
routeRouter.patch("/", editRoute)
routeRouter.post("/bulk", upload.single("ExcelFile"), addExcel)


module.exports = routeRouter;