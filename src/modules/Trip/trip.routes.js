const { addTrip, getTrip, deleteTrip, updateData } = require("./trip.controller");
const { Router } = require("express");

const tripRouter = Router();

tripRouter.post("/", addTrip);
tripRouter.get("/", getTrip);
tripRouter.delete("/:deleteId", deleteTrip);
tripRouter.patch("/", updateData);

module.exports = tripRouter;
