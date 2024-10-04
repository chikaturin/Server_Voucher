const ReportVoucher = require("../Schema/schema").ReportVoucher;
const CounterReport = require("../Schema/schema").counterReport;

const CreateReport = async (req, res) => {
  try {
    const { Content, Voucher_ID, ReportedBy } = req.body;
    const DayReport = new Date();
    const counter = await CounterReport.findOneAndUpdate(
      { _id: "Report" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const _id = `RPT${counter.seq}`;
    const StateReport = "UnSolve";
    const reportVoucher = new ReportVoucher({
      _id,
      Content,
      DayReport,
      Voucher_ID,
      ReportedBy,
      StateReport,
    });
    await reportVoucher.save();
    res.status(201).json({ message: "Create ReportVoucher successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteReportVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const reportVoucher = await ReportVoucher.findOneAndDelete({ _id });
    if (!reportVoucher) {
      return res.status(404).json({ message: "ReportVoucher not found" });
    }
    res.status(200).json({ message: "Delete ReportVoucher successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getReport = async (req, res) => {
  try {
    const report = await ReportVoucher.find();
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const SolveReport = async (req, res) => {
  try {
    const { _id } = req.params;
    const report = await ReportVoucher.findByIdAndUpdate(
      { _id },
      { StateReport: "Solve" },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json({ message: "Solve Report successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  CreateReport,
  deleteReportVoucher,
  getReport,
  SolveReport,
};
