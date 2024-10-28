const express = require("express");
const router = express.Router();

const {
  register,
  signIn,
  getService,
  getPartner,
  createService,
} = require("../Controller/AccountController.js");
const { checktokken, ReadToken } = require("../Middleware/check.js");

router.post("/register", register);
router.post("/signIn", signIn);

router.get("/getService", getService);
router.get("/getPartner", getPartner);
router.post("/createService", createService);
router.get("/user", checktokken, (req, res) => {
  res.json(req.decoded);
});

router.get("/readtoken", ReadToken);

module.exports = router;
