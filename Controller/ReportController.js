const ReportVoucher = require("../Schema/schema").ReportVoucher;
const CounterReport = require("../Schema/schema").counterReport;
const { z } = require("zod");
const redisClient = require("../Middleware/redisClient");

const ensureRedisConnection = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

let numredis = 0;

const CreateReport = async (req, res) => {
  const ReportSchema = z.object({
    Content: z.string().min(1, "Content is required"),
    Voucher_ID: z.string(),
  });

  try {
    const validateReport = ReportSchema.parse(req.body);
    const { Content, Voucher_ID } = validateReport;
    const ReportedBy = req.decoded?.email;
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
    numredis = Math.floor(Math.random() * 100);
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
    numredis = math.floor(Math.random() * 100);
    res.status(200).json({ message: "Delete ReportVoucher successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getReport = async (req, res) => {
  try {
    await ensureRedisConnection();
    const cacheKey = `ReportVoucher:${numredis}`;
    const cacheReport = await redisClient.get(cacheKey);
    if (cacheReport) {
      return res.status(200).json(JSON.parse(cacheReport));
    }
    const report = await ReportVoucher.find();
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    await redisClient.set(cacheKey, JSON.stringify(report));
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
    numredis = math.floor(Math.random() * 100);
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
