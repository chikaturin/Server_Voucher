const express = require("express");
const router = express.Router();
const {
  createGeneralVoucher,
  getGeneralVoucherByAdmin,
  getVoucherByService,
  getvoucherManagerbyService,
  updateGeneralVoucher,
  deleteGeneralVoucher,
} = require("../Controller/GenaralVoucher.js");

const checktokken = require("../Middleware/check.js").checktokken;
const checkAPIkey = require("../Middleware/check.js").checkAPIkey;

router.post("/createGeneralVoucher", checktokken, createGeneralVoucher);
router.get("/getGeneralVoucherByAdmin", getGeneralVoucherByAdmin);
router.get("/getVoucherByService", checkAPIkey, getVoucherByService); //lấy từ api key
router.get(
  "/getvoucherManagerbyService",
  checktokken,
  getvoucherManagerbyService
);
router.put("/updateGeneralVoucher/:_id", updateGeneralVoucher);
router.delete("/deleteGeneralVoucher/:_id", deleteGeneralVoucher);

module.exports = router;
