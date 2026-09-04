const { Router } = require("express");
const { addVehicle, importExcelFile, deleteVehicle, updateVehicle, getVehicle } = require("./vehicle.controller");
const upload = require("../../middlewares/multer")
const vehicleRouter = Router();


vehicleRouter.post("/", addVehicle);
vehicleRouter.post("/bulk", upload.single("vehicleExcelFile"), importExcelFile);
vehicleRouter.delete("/deletevehicle/:id", deleteVehicle);
vehicleRouter.patch("/", updateVehicle);
vehicleRouter.get("/", getVehicle)



module.exports = vehicleRouter;
