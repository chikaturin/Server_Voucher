const express = require("express");
const router = express.Router();

const {
  createPrivateVoucher,
  updatePrivateVoucher,
  deletePrivateVoucher,
  getPrivateVoucher,
  getPrivateVoucherByAdmin,
  getPrivateVoucherByPartner,
} = require("../Controller/PrivateVoucherController.js");

const checktoken = require("../Middleware/checktoken.js");

router.post("/createPrivateVoucher", checktoken, createPrivateVoucher);
router.put("/updatePrivateVoucher/:_id", updatePrivateVoucher);
router.delete("/deletePrivateVoucher/:_id", deletePrivateVoucher);
router.get("/getPrivateVoucher/:Service_ID", getPrivateVoucher);
router.get("/getPrivateVoucherByAdmin", getPrivateVoucherByAdmin);
router.get(
  "/getPrivateVoucherByPartner",
  checktoken,
  getPrivateVoucherByPartner
);
