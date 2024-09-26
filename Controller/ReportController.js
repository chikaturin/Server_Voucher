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
    const reportVoucher = new ReportVoucher({
      _id,
      Content,
      DayReport,
      Voucher_ID,
      ReportedBy,
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

module.exports = {
  CreateReport,
  deleteReportVoucher,
};
