const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number,
});

// This is the schema for the partner account model
const AccountAdminSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Name: { type: String, required: true },
  PassWord: { type: String, required: true },
});

const ServiceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  ServiceName: { type: String, required: true },
});

const PartnerSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Name: { type: String, required: true },
  Partner_ID: { type: String, required: true },
});

// Schema for general vouchers applicable across the entire website of a partner
const VoucherSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Name: { type: String, required: true },
  ReleaseTime: { type: Date, required: true },
  ExpiredTime: { type: Date },
  Description: { type: String },
  Image: { type: String },
  RemainQuantity: { type: Number, required: true },
  MinValue: { type: Number },
  MaxValue: { type: Number },
  PercentDiscount: { type: Number, required: true },
  ServiceID: { type: String },
  Partner_ID: { type: String },
  Status: { type: String, required: true },
});

// Schema for customer vouchers when they accumulate points
const VoucherCusSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Cus_ID: { type: String, required: true }, // dựa vào token để lấy ID_Cus
  Voucher_ID: { type: String, required: true },
});

// Schema for payment (ThanhToan) related data
const HistorySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Voucher_ID: { type: String, required: true },
  Partner_ID: { type: String, required: true },
  TotalDiscount: { type: Number, required: true },
  AmountUsed: { type: Number, required: true },
  Date: { type: Date, required: true },
});

const ReportVoucherSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Content: { type: String, required: true },
  DayReport: { type: Date, required: true },
  Voucher_ID: { type: String, required: true },
  ReportedBy: { type: String, required: true },
});

const NoteVoucherSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  State: { type: String, required: true },
  Voucher_ID: { type: String, required: true },
  Price: { type: Number, required: true },
  Product_ID: { type: String, required: true },
});

// Models
const AccountAdmin = mongoose.model("AccountPartNer", AccountAdminSchema);
const VoucherGenaral = mongoose.model("Voucher", VoucherSchema);
const VoucherCus = mongoose.model("VoucherCus", VoucherCusSchema);
const History = mongoose.model("History", HistorySchema);
const ReportVoucher = mongoose.model("ReportVoucher", ReportVoucherSchema);
const NoteVoucher = mongoose.model("NoteVoucher", NoteVoucherSchema);
const Service = mongoose.model("Service", ServiceSchema);
const Partner = mongoose.model("Partner", PartnerSchema);

const counterVoucher = mongoose.model("CounterVoucher", counterSchema);
const counterVoucherService = mongoose.model(
  "CounterVoucherService",
  counterSchema
);
const counterVoucherPartner = mongoose.model(
  "CounterVoucherPartner",
  counterSchema
);
const counterVoucherCus = mongoose.model("CounterVoucherCus", counterSchema);
const counterHistory = mongoose.model("CounterHistory", counterSchema);
const counterReportVoucher = mongoose.model(
  "CounterReportVoucher",
  counterSchema
);

// const VoucherCus = mongoose.model("VoucherCus", VoucherCusSchema);

module.exports = {
  counterVoucher,
  counterHistory,
  counterVoucherCus,
  counterReportVoucher,
  counterVoucherPartner,
  counterVoucherService,

  AccountAdmin,
  ReportVoucher,
  VoucherGenaral,
  VoucherCus,
  History,
  NoteVoucher,
  Service,
  Partner,
};
