const express = require("express");
const router = express.Router();

const {
  register,
  signIn,
  getAccountByService,
  getAccount,
  getService,
  getPartner,
  createService,
  createPartner,
  getServiceID,
} = require("../Controller/AccountController.js");
const CheckToken = require("../Middleware/check.js").checktokken;

router.post("/register", register);
router.post("/signIn", signIn);
router.get("/getAccountByService", CheckToken, getAccountByService);
router.get("/getAccount", getAccount);
router.get("/getServiceID/:id", getServiceID);

router.get("/getService", getService);
router.get("/getPartner", getPartner);
router.post("/createService", createService);
router.post("/createPartner", createPartner);

module.exports = router;
