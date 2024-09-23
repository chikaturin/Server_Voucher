const express = require("express");
const router = express.Router();

const {
  register,
  signIn,
  getAccountByPartner,
  getAccount,
  getService,
  getPartner,
  createService,
  createPartner,
  getPartnerID,
} = require("../Controller/AccountController.js");
const CheckToken = require("../Middleware/check.js").checktokken;

router.post("/register", register);
router.post("/signIn", signIn);
router.get("/getAccountByPartner", CheckToken, getAccountByPartner);
router.get("/getAccount", getAccount);
router.get("/getPartnerID/:id", getPartnerID);

router.get("/getService", getService);
router.get("/getPartner", getPartner);
router.post("/createService", createService);
router.post("/createPartner", createPartner);

module.exports = router;
