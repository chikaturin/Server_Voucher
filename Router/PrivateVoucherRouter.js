const express = require("express");
const router = express.Router();

const {
  createPrivateVoucher,
  updatePrivateVoucher,
  deletePrivateVoucher,
  getPrivateVoucherByService,
  getPrivateVoucherByAdmin,
  getPrivateVoucherByPartner,
} = require("../Controller/PrivateVoucherController.js");
const { checkAPIkey } = require("../Middleware/check.js");

const checktoken = require("../Middleware/check.js").checktokken;

router.post(
  "/createPrivateVoucher",
  checktoken,
  checkAPIkey,
  createPrivateVoucher
);
router.put("/updatePrivateVoucher/:_id", updatePrivateVoucher);
router.delete("/deletePrivateVoucher/:_id", deletePrivateVoucher);
router.get(
  "/getPrivateVoucherByService",
  checkAPIkey,
  getPrivateVoucherByService
);
router.get("/getPrivateVoucherByAdmin", getPrivateVoucherByAdmin);
router.get(
  "/getPrivateVoucherByPartner",
  checktoken,
  checkAPIkey,
  getPrivateVoucherByPartner
);

module.exports = router;
