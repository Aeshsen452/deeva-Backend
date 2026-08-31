const { addDriver, getDrivers, deleteDriver, updateDriver } = require("./driver.controller");
const { Router } = require("express");

const driverRouter = Router();


driverRouter.post("/", addDriver);
driverRouter.get("/", getDrivers);
driverRouter.delete("/:id", deleteDriver);
driverRouter.patch("/", updateDriver);



module.exports = driverRouter;