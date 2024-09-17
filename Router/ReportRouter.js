const express = require("express");
const router = express.Router();

const {
  CreateReport,
  deleteReportVoucher,
} = require("../Controller/ReportController.js");

router.post("/CreateReport", CreateReport);
router.delete("/deleteReportVoucher/:_id", deleteReportVoucher);

module.exports = router;
