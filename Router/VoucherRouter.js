const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileUpdate = require("../config/cloudinary.config.js");
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
  GetVoucherWithService,
  findcondition,
} = require("../Controller/VoucherController.js");

const { checktokken } = require("../Middleware/check.js");

router.post(
  "/createVoucherByAdmin",
  fileUpdate.single("voucher"),
  createVoucherbyAdmin
);

router.post(
  "/createVoucherByPartner",
  checktokken,
  fileUpdate.single("voucher"),
  createVoucherbyPartner
);

router.get("/getVoucherByAdmin", getVoucherByAdmin);
router.get("/DetailVoucher/:_id", DetailVoucher);
router.get(
  "/GetVoucherWithService/:Service_ID",
  checktokken,
  GetVoucherWithService
);

router.get(
  "/getvoucherManagerbyPartner",
  checktokken,
  getvoucherManagerbyPartner
);

router.put("/updateVoucher/:_id", updateVoucher);
router.get("/updateState/:_id", updateState);
router.get("/deleteVoucher/:_id", deleteVoucher);

router.put("/updateCondition/:_id", updateCondition);

router.get("/findcondition/:_id", findcondition);

module.exports = router;
