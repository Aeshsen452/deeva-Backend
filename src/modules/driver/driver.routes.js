const { addDriver, getDrivers, deleteDriver, updateDriver, importExcelData, exportExcelData } = require("./driver.controller");
const { Router } = require("express");
const upload = require("../../middlewares/multer");

const driverRouter = Router();


driverRouter.post("/", addDriver);
driverRouter.get("/", getDrivers);
driverRouter.delete("/:id", deleteDriver);
driverRouter.patch("/", updateDriver);
driverRouter.post("/bulk", upload.single("driverExcelFile"), importExcelData);
driverRouter.get("/bulk", exportExcelData);


module.exports = driverRouter;