const { Router } = require("express");
const { createSummary, getSummary, updateSummary } = require("./Salary.controller");


const SalarySummaryRouter = Router();

SalarySummaryRouter.post("/", createSummary);
SalarySummaryRouter.get("/", getSummary);
SalarySummaryRouter.patch("/", updateSummary);


module.exports = SalarySummaryRouter;