const ReportVoucher = require("../Schema/schema").ReportVoucher;
const CounterReportVoucher = require("../Schema/schema").counterReportVoucher;

const CreateReport = async (req, res) => {
  try {
    const { Content, Voucher_ID, ReportedBy } = req.body;
    const DayReport = new Date();
    const _id = `RP${CounterReportVoucher.seq}`;
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
