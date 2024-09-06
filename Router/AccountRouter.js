const express = require("express");
const router = express.Router();

const {
  register,
  signIn,
  getAccountByPartner,
  getAccount,
} = require("../Controller/AccountController.js");

router.post("/register", register);
router.post("/signIn", signIn);
router.get("/getAccountByPartner", getAccountByPartner);
router.get("/getAccount", getAccount);

module.exports = router;
