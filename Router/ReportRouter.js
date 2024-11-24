const express = require("express");
const router = express.Router();

const {
  CreateReport,
  deleteReportVoucher,
  getReport,
  SolveReport,
} = require("../Controller/ReportController.js");

const { checktokken, ReadToken } = require("../Middleware/check.js");

router.post("/createReport", checktokken, CreateReport);
router.delete("/deleteReportVoucher/:_id", deleteReportVoucher);
router.get("/getReport", getReport);
router.get("SolveReport/:_id", SolveReport);

module.exports = router;
