const express = require("express");
const router = express.Router();

const {
  CalculateVoucher,
  UsedVoucher,
  UseVoucher,
} = require("../Controller/PayController.js");

router.post("/CalculateVoucher", CalculateVoucher);
router.post("/UsedVoucher/:_id", UsedVoucher);
router.post("/UseVoucher", UseVoucher);

module.exports = router;
