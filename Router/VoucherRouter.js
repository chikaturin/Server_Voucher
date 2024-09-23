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
} = require("../Controller/VoucherController.js");

const checktokken = require("../Middleware/check.js").checktokken;

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
router.post("/updateState/:_id", updateState);
router.delete("/deleteVoucher/:_id", deleteVoucher);

module.exports = router;
