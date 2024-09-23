const HistoryDB = require("../Schema/schema").History;
const CounterHistoryDB = require("../Schema/schema").counterHistory;

const createHistory = async (req, res) => {
  try {
    const { Voucher_ID, Partner_ID, TotalDiscount, AmountUsed, Date } =
      req.body;
    const date = new Date();
    const _id = `HIS${CounterHistoryDB.seq}`;
    const history = new HistoryDB({
      _id,
      Voucher_ID,
      Partner_ID,
      TotalDiscount,
      AmountUsed,
      Date,
    });
    await history.save();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const Statistical_Voucher = async (req, res) => {
  const { Date } = req.body;
  const history = await HistoryDB.find({ Date });
  if (!history) {
    return res.status(404).json({ message: "History not found" });
  }
  res.json(history);
};

const Staitstical_PartnerService = async (req, res) => {
  const { Partner_ID } = req.decoded._id;
  const history = await HistoryDB.find({ Partner_ID });
  if (!history) {
    return res.status(404).json({ message: "History not found" });
  }
  res.json(history);
};

module.exports = {
  createHistory,
  Statistical_Voucher,
  Staitstical_PartnerService,
};
