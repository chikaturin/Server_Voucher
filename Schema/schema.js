const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number,
});

// This is the schema for the partner account model
const AccountServiceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  ServiceName: { type: String, required: true },
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
  Service_ID: { type: String, required: true }, // This is the service code of each partner
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
  Partner_ID: { type: String, required: true }, // This is the ID_Partner of the partner=tên cửa hàng
  Service_ID: { type: String, required: true }, // This is the service code of each partner=apikey
});

// Schema for customer vouchers when they accumulate points
// const VoucherCusSchema = new mongoose.Schema({
//   _id: { type: String, required: true },
//   Name: { type: String, required: true },
//   PercentDiscount: { type: Number, required: true },
//   StartDate: { type: Date, required: true },
//   EndDate: { type: Date },
//   Description: { type: String },
//   Quantity: { type: Number, required: true },
//   Conditions: { type: Number, required: true },
//   ID_Cus: { type: String, required: true }, // dựa vào token để lấy ID_Cus
// });

// Schema for payment (ThanhToan) related data
const ThanhToanSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Cus_ID: { type: String, required: true },
  Service_ID: { type: String, required: true },
  Voucher_ID: { type: String, required: true },
  priceBeforeDiscount: { type: Number, required: true },
  PercentDiscount: { type: Number, required: true },
  priceAfterDiscount: { type: Number, required: true },
  Date: { type: Date, required: true },
});

const ReportVoucherSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  ErrorType: { type: String, required: true },
  Voucher_ID: { type: String, required: true },
  Description: { type: String, required: true },
  Image: { type: String, required: true },
  DateReport: { type: Date, required: true },
});

// Models
const AccountService = mongoose.model("AccountPartNer", AccountServiceSchema);
const GeneralVoucher = mongoose.model("GeneralVoucher", GeneralVoucherSchema);
const counterGenaralVoucher = mongoose.model("GenaralVoucher", counterSchema);
const counterPrivateVoucher = mongoose.model(
  "CounterPrivateVoucher",
  counterSchema
);
const counterThanhToan = mongoose.model("CounterThanhToan", counterSchema);
const counterReportVoucher = mongoose.model(
  "CounterReportVoucher",
  counterSchema
);
const PrivateVoucher = mongoose.model("PrivateVoucher", PrivateVoucherSchema);
// const VoucherCus = mongoose.model("VoucherCus", VoucherCusSchema);
const ThanhToan = mongoose.model("ThanhToan", ThanhToanSchema);
const ReportVoucher = mongoose.model("ReportVoucher", ReportVoucherSchema);

module.exports = {
  counterGenaralVoucher,
  counterPrivateVoucher,
  counterThanhToan,
  counterReportVoucher,

  AccountService,
  GeneralVoucher,
  PrivateVoucher,
  // VoucherCus,
  ThanhToan,
  ReportVoucher,
};
