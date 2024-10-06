const express = require("express");
const router = express.Router();

const {
  createHistory,
  Statistical_Voucher,
  Staitstical_PartnerService,
  StatisticalSort,
  Statistical_VoucherFindPartner_Service,
} = require("../Controller/StatisticalController.js");

const checktokken = require("../Middleware/check.js").checktokken;

router.post("/createHistory", createHistory);
router.get("/Statistical_Voucher", Statistical_Voucher);
router.get(
  "/Staitstical_PartnerService",
  checktokken,
  Staitstical_PartnerService
);
router.post("/StatisticalSort", StatisticalSort);

router.get(
  "/Statistical_VoucherFindPartner_Service",
  Statistical_VoucherFindPartner_Service
);

module.exports = router;
