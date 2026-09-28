const { addTrip, getTrip, deleteTrip, updateData, bulkTrip, exportExcel } = require("./trip.controller");
const { Router } = require("express");
const upload = require("../../middlewares/multer");

const tripRouter = Router();

tripRouter.post("/", addTrip);
tripRouter.get("/", getTrip);
tripRouter.delete("/:deleteId", deleteTrip);
tripRouter.patch("/", updateData);
tripRouter.post("/bulk", upload.single("ExcelFile"), bulkTrip);
tripRouter.get("/bulk", exportExcel);

module.exports = tripRouter;
