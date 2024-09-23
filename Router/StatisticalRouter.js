const express = require("express");
const router = express.Router();

const {
  createHistory,
  Statistical_Voucher,
  Staitstical_PartnerService,
} = require("../Controller/StatisticalController.js");

const checktokken = require("../Middleware/check.js").checktokken;

router.post("/createHistory", createHistory);
router.get("/Statistical_Voucher", Statistical_Voucher);
router.get(
  "/Staitstical_PartnerService",
  checktokken,
  Staitstical_PartnerService
);

module.exports = router;
