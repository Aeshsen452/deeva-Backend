const { addTrip, getTrip } = require("./trip.controller");
const { Router } = require("express");

const tripRouter = Router();

tripRouter.post("/", addTrip);
tripRouter.get("/", getTrip);


module.exports = tripRouter;
