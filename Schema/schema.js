const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number,
});

// This is the schema for the partner account model
const AccountPartNerSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  PartnerName: { type: String, required: true },
  PassWord: { type: String, required: true },
  Service: { type: String, required: true },
  Api_key: { type: String, required: true },
});

// Schema for general vouchers applicable across the entire website of a partner
const GeneralVoucherSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Name: { type: String, required: true },
  PercentDiscount: { type: Number, required: true },
  StartDate: { type: Date, required: true },
  EndDate: { type: Date },
  Description: { type: String },
  Image: { type: String },
  Quantity: { type: Number, required: true },
  Conditions: { type: Number, required: true },
  Partner_ID: { type: String, required: true }, // This is the ID_Partner of the partner
});

// Schema for private vouchers created for each service by the partner
const PrivateVoucherSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Name: { type: String, required: true },
  PercentDiscount: { type: Number, required: true },
  StartDate: { type: Date, required: true },
  EndDate: { type: Date },
  Description: { type: String },
  Image: { type: String },
  Quantity: { type: Number, required: true },
  Conditions: { type: Number, required: true },
  Partner_ID: { type: String, required: true }, // This is the ID_Partner of the partner
  Service_ID: { type: String, required: true }, // This is the service code of each partner
});

// Schema for customer vouchers when they accumulate points
const VoucherCusSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Name: { type: String, required: true },
  PercentDiscount: { type: Number, required: true },
  StartDate: { type: Date, required: true },
  EndDate: { type: Date },
  Description: { type: String },
  Quantity: { type: Number, required: true },
  Conditions: { type: Number, required: true },
  ID_Cus: { type: String, required: true }, // dựa vào token để lấy ID_Cus
});

// Schema for payment (ThanhToan) related data
const ThanhToanSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Name: { type: String, required: true },
  PercentDiscount: { type: Number, required: true },
  StartDate: { type: Date, required: true },
  EndDate: { type: Date },
  Description: { type: String },
  Quantity: { type: Number, required: true },
  Conditions: { type: Number, required: true },
  VoucherPartner: { type: String, required: true },
  Tokken: { type: String, required: true },
});

// Models
const AccountPartNer = mongoose.model("AccountPartNer", AccountPartNerSchema);
const GeneralVoucher = mongoose.model("GeneralVoucher", GeneralVoucherSchema);
const counterGenaralVoucher = mongoose.model("GenaralVoucher", counterSchema);
const counterPrivateVoucher = mongoose.model(
  "CounterPrivateVoucher",
  counterSchema
);
const PrivateVoucher = mongoose.model("PrivateVoucher", PrivateVoucherSchema);
const VoucherCus = mongoose.model("VoucherCus", VoucherCusSchema);
const ThanhToan = mongoose.model("ThanhToan", ThanhToanSchema);

module.exports = {
  counterGenaralVoucher,
  counterPrivateVoucher,

  AccountPartNer,
  GeneralVoucher,
  PrivateVoucher,
  VoucherCus,
  ThanhToan,
};
