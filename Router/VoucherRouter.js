const express = require("express");
const router = express.Router();
const {
  createVoucherbyAdmin,
  createVoucherbyService,
  createVoucherbyPartner,
  updateVoucher,
  deleteVoucher,
  getVoucherByAdmin,
  getvoucherManagerbyService,
  getvoucherManagerbyPartner,
  getVoucherByService,
} = require("../Controller/VoucherController.js");

const checktokken = require("../Middleware/check.js").checktokken;
const checkAPIkey = require("../Middleware/check.js").checkAPIkey;

router.post("/createVoucherByAdmin", checktokken, createVoucherbyAdmin);
router.post("/createVoucherByService", checkAPIkey, createVoucherbyService);
router.post("/createVoucherByPartner", checktokken, createVoucherbyPartner);

router.get("/getVoucherByAdmin", getVoucherByAdmin);

router.get(
  "/getvoucherManagerbyService",
  checktokken,
  getvoucherManagerbyService
);
router.get(
  "/getvoucherManagerbyPartner",
  checktokken,
  getvoucherManagerbyPartner
);
router.get("/getVoucherByService", checkAPIkey, getVoucherByService);

router.put("/updateVoucher/:_id", updateVoucher);
router.delete("/deleteVoucher/:_id", deleteVoucher);

module.exports = router;
