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
const { checktokken, ReadToken } = require("../Middleware/check.js");

router.post("/register", register);
router.post("/signIn", signIn);
router.get("/getAccountByPartner", checktokken, getAccountByPartner);
router.get("/getAccount", getAccount);
router.get("/getPartnerID/:id", getPartnerID);

router.get("/getService", getService);
router.get("/getPartner", getPartner);
router.post("/createService", createService);
router.post("/createPartner", createPartner);
router.get("/user", checktokken, (req, res) => {
  res.json(req.decoded);
});

router.get("/readtoken", ReadToken);

module.exports = router;
