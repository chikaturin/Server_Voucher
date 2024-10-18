const express = require("express");
const router = express.Router();

const {
  CalculateVoucher,
  ApplyVoucher,
  getVoucherByCus,
  ReceiveVoucher,
  CheckVoucher,
  CheckPoint,
  RequireVoucher,
  GetNote,
} = require("../Controller/PayController.js");
const { checktokken } = require("../Middleware/check.js");

const CheckToken = require("../Middleware/check.js").checktokken;

router.post("/CalculateVoucher", CalculateVoucher);
router.post("/ApplyVoucher/:_id", ApplyVoucher);
router.post("/getVoucherByCus", getVoucherByCus);

router.post("/ReceiveVoucher", CheckToken, ReceiveVoucher);
router.post("/CheckVoucher", CheckToken, CheckVoucher);

router.get("/CheckPoint", CheckToken, CheckPoint);

router.post("/RequireVoucher", RequireVoucher);

router.get("/GetNote/:OrderID", GetNote);

router.get("/CheckToken", checktokken);

module.exports = router;
