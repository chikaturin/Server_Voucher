const express = require("express");
const router = express.Router();
const {
  createGeneralVoucher,
  getGeneralVoucherByAdmin,
  getVoucherByPartner,
  getvoucherManagerbyPartner,
  updateGeneralVoucher,
  deleteGeneralVoucher,
} = require("../Controller/GenaralVoucher.js");

const checktoken = require("../Middleware/checktoken.js");

router.post("/createGeneralVoucher", checktoken, createGeneralVoucher);
router.get("/getGeneralVoucherByAdmin", getGeneralVoucherByAdmin);
router.get("/getVoucherByPartner", getVoucherByPartner); //lấy từ api key
router.get(
  "/getvoucherManagerbyPartner",
  checktoken,
  getvoucherManagerbyPartner
);
router.put("/updateGeneralVoucher/:_id", updateGeneralVoucher);
router.delete("/deleteGeneralVoucher/:_id", deleteGeneralVoucher);
