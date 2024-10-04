const express = require("express");
const router = express.Router();

const {
  CreateReport,
  deleteReportVoucher,
  getReport,
  SolveReport,
} = require("../Controller/ReportController.js");

router.post("/createReport", CreateReport);
router.delete("/deleteReportVoucher/:_id", deleteReportVoucher);
router.get("/getReport", getReport);
router.get("SolveReport/:_id", SolveReport);

module.exports = router;
