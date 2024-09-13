const express = require("express");
const router = express.Router();

const {
  register,
  signIn,
  getAccountByService,
  getAccount,
} = require("../Controller/AccountController.js");
const CheckToken = require("../Middleware/check.js").checktokken;

router.post("/register", register);
router.post("/signIn", signIn);
router.get("/getAccountByService", CheckToken, getAccountByService);
router.get("/getAccount", getAccount);

module.exports = router;
