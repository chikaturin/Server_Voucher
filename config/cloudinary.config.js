require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: "di9qbdj8w",
  api_key: process.env.CLOUD_ACCESS_KEY_ID,
  api_secret: "o2tDSh_8PAM--EIkpqHlDPnoJ8U",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Voucher",
    allowed_formats: ["jpg", "png"],
  },
});

const uploadCloud = multer({ storage });
module.exports = uploadCloud;
