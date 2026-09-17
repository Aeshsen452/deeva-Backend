const { Router } = require("express");
const { GetDriverData } = require("./dash.controller")


const dashBoardRouter = Router();

dashBoardRouter.get("/", GetDriverData);


module.exports = dashBoardRouter