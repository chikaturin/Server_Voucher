const express = require("express");
const router = express.Router();
const {
  createVoucherbyAdmin,
  createVoucherbyPartner,
  updateVoucher,
  deleteVoucher,
  getVoucherByAdmin,
  getvoucherManagerbyPartner,
  DetailVoucher,
  updateState,
  updateCondition,
} = require("../Controller/VoucherController.js");

const { checktokken, ReadToken } = require("../Middleware/check.js");

router.post("/createVoucherByAdmin", createVoucherbyAdmin);
router.post("/createVoucherByPartner", checktokken, createVoucherbyPartner);

router.get("/getVoucherByAdmin", getVoucherByAdmin);
router.get("/DetailVoucher/:_id", DetailVoucher);

router.get(
  "/getvoucherManagerbyPartner",
  checktokken,
  getvoucherManagerbyPartner
);

router.put("/updateVoucher/:_id", updateVoucher);
router.get("/updateState/:_id", updateState);
router.get("/deleteVoucher/:_id", deleteVoucher);

router.post("/updateCondition/:_id", updateCondition);

module.exports = router;
