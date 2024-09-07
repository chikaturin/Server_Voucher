const express = require("express");
const router = express.Router();

const {
  register,
  signIn,
  getAccountByService,
  getAccount,
} = require("../Controller/AccountController.js");
const CheckToken = require("../Middleware/checktoken.js");

router.post("/register", register);
router.post("/signIn", signIn);
router.get("/getAccountByPartner", CheckToken, getAccountByService);
router.get("/getAccount", getAccount);

module.exports = router;
