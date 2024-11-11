const express = require("express");
const router = express.Router();

const {
  // createHistory,
  // Statistical_Voucher,
  // HistoryCus,
  Statistical_ID,
  Statistical_PartnerService,
  StatisticalSort,
  Statistical_VoucherAdmin,
} = require("../Controller/StatisticalController.js");

const checktokken = require("../Middleware/check.js").checktokken;

// router.post("/createHistory", createHistory);
// router.get("/Statistical_Voucher", Statistical_Voucher);
// router.get("/HistoryCus", checktokken, HistoryCus);

router.get("/Statistical_ID/:_id", Statistical_ID);

router.get(
  "/Statistical_PartnerService",
  checktokken,
  Statistical_PartnerService
);
router.post("/StatisticalSort", StatisticalSort);

router.get("/Statistical_VoucherAdmin", Statistical_VoucherAdmin);

module.exports = router;
