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

const checktoken = require("../Middleware/checktoken.js");

router.post("/createGeneralVoucher", checktoken, createGeneralVoucher);
router.get("/getGeneralVoucherByAdmin", getGeneralVoucherByAdmin);
router.get("/getVoucherByService", getVoucherByService); //lấy từ api key
router.get(
  "/getvoucherManagerbyService",
  checktoken,
  getvoucherManagerbyService
);
router.put("/updateGeneralVoucher/:_id", updateGeneralVoucher);
router.delete("/deleteGeneralVoucher/:_id", deleteGeneralVoucher);

module.exports = router;
