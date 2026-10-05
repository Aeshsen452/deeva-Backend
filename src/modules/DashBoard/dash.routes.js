const { Router } = require("express");
const { GetDriverData, GetAllDriver } = require("./dash.controller")


const dashBoardRouter = Router();

dashBoardRouter.get("/", GetDriverData);
dashBoardRouter.get("/driver", GetAllDriver);


module.exports = dashBoardRouter