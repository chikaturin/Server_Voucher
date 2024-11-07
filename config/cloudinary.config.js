require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_ACCESS_KEY_ID,
  api_secret: process.env.CLOUD_SECRET_ACCESS_KEY,
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
