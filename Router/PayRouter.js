const express = require("express");
const router = express.Router();

const {
  CalculateVoucher,
  UsedVoucher,
} = require("../Controller/PayController.js");

router.post("/CalculateVoucher", CalculateVoucher);
router.post("/UsedVoucher/:_id", UsedVoucher);

module.exports = router;
