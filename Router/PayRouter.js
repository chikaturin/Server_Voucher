const express = require("express");
const router = express.Router();

const {
  CalculateVoucher,
  ApplyVoucher,
  getVoucherByCus,
} = require("../Controller/PayController.js");

router.post("/CalculateVoucher", CalculateVoucher);
router.post("/ApplyVoucher/:_id", ApplyVoucher);
router.post("/getVoucherByCus", getVoucherByCus);

module.exports = router;
