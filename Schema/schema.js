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

const HaveVoucherSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Voucher_ID: { type: String, required: true },
  Service_ID: { type: String, required: true },
});

const PartnerSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Name: { type: String, required: true },
});

const ConditionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  MaxValue: { type: Number, required: true },
  MinValue: { type: Number, required: true },
  PercentDiscount: { type: Number, required: true },
  Voucher_ID: { type: String, required: true },
});

// Schema for general vouchers applicable across the entire website of a partner
const VoucherSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Name: { type: String, required: true },
  ReleaseTime: { type: Date, required: true },
  ExpiredTime: { type: Date, required: true },
  Description: { type: String },
  Image: { type: String },
  RemainQuantity: { type: Number, required: true },
  States: { type: String, required: true },
  Partner_ID: { type: String },
  MinCondition: { type: Number },
});

// Schema for payment (ThanhToan) related data
const HistorySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  Voucher_ID: { type: String, required: true },
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

// Models
const AccountAdmin = mongoose.model("Admin", AccountAdminSchema);
const Voucher = mongoose.model("Voucher", VoucherSchema);
const History = mongoose.model("History", HistorySchema);
const ReportVoucher = mongoose.model("ReportVoucher", ReportVoucherSchema);
const Service = mongoose.model("Service", ServiceSchema);
const Partner = mongoose.model("Partner", PartnerSchema);
const Condition = mongoose.model("Condition", ConditionSchema);
const HaveVoucher = mongoose.model("HaveVoucher", HaveVoucherSchema);

const counterVoucher = mongoose.model("CounterVoucher", counterSchema);
const counterHistory = mongoose.model("CounterHistory", counterSchema);
const counterReport = mongoose.model("CounterReportVoucher", counterSchema);
const counterService = mongoose.model("CounterService", counterSchema);
const counterPartner = mongoose.model("CounterPartner", counterSchema);
const counterHaveVoucher = mongoose.model("CounterHaveVoucher", counterSchema);
const counterCondition = mongoose.model("CounterCondition", counterSchema);

module.exports = {
  counterVoucher,
  counterHistory,
  counterReport,
  counterService,
  counterPartner,
  counterHaveVoucher,
  counterCondition,

  AccountAdmin,
  ReportVoucher,
  Voucher,
  History,
  Service,
  Partner,
  Condition,
  HaveVoucher,
};
