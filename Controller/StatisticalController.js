const HistoryDB = require("../Schema/schema").History;
const CounterHistoryDB = require("../Schema/schema").counterHistory;
const redisClient = require("../Middleware/redisClient");
const { Voucher } = require("../Schema/schema");
const ensureRedisConnection = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

const createHistory = async (req, res) => {
  try {
    const { Voucher_ID, CusID, TotalDiscount, Date } = req.body;

    let historyCounter = await CounterHistoryDB.findOneAndUpdate(
      { _id: "Statistical" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const _id = `HIS${historyCounter.seq}`;
    const history = new HistoryDB({
      _id,
      Voucher_ID,
      CusID,
      TotalDiscount,
      Date,
    });
    await history.save();

    res.status(201).json({ message: "History created successfully", _id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const Statistical_Voucher = async (req, res) => {
  await ensureRedisConnection();
  const cacheKey = "Statistical_Voucher";
  const cacheStatistical = await redisClient.get(cacheKey);
  if (cache) {
    return res.status(200).json(JSON.parse(cacheStatistical));
  }
  const history = await HistoryDB.find();
  if (!history) {
    return res.status(404).json({ message: "History not found" });
  }
  await redisClient.set(cacheKey, JSON.stringify(history));
  res.json(history);
};

const HistoryCus = async (req, res) => {
  await ensureRedisConnection();
  const { CusID } = req.decoded._id;
  const cacheKey = `HistoryCus_${CusID}`;
  const cacheHistory = await redisClient.get(cacheKey);
  if (cacheHistory) {
    return res.status(200).json(JSON.parse(cacheHistory));
  }

  const history = await HistoryDB.find({ CusID });
  if (!history) {
    return res.status(404).json({ message: "History not found" });
  }
  await redisClient.set(cacheKey, JSON.stringify(history));
  res.json(history);
};

const Statistical_VoucherFindPartner_Service = async (req, res) => {
  try {
    await ensureRedisConnection();
    const cacheKey = "Statistical_VoucherFindPartner_Service";
    const cacheStatistical = await redisClient.get(cacheKey);
    if (cacheStatistical) {
      return res.status(200).json(JSON.parse(cacheStatistical));
    }
    const Statistical = await HistoryDB.aggregate([
      {
        $lookup: {
          from: "vouchers",
          localField: "Voucher_ID",
          foreignField: "_id",
          as: "vouchers",
        },
      },
      {
        $lookup: {
          from: "havevouchers",
          localField: "Voucher_ID",
          foreignField: "Voucher_ID",
          as: "haveVouchers",
        },
      },
    ]);
    await redisClient.set(cacheKey, JSON.stringify(Statistical));
    res.json(Statistical);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Statistical_PartnerService = async (req, res) => {
  try {
    await ensureRedisConnection();
    const { Partner_ID } = req.decoded.partnerId;

    const cacheStatistical = await redisClient.get(`Statistical:${Partner_ID}`);

    if (cacheStatistical) {
      return res.status(200).json(JSON.parse(cacheStatistical));
    }

    const Statistical = await HistoryDB.aggregate([
      {
        $match: { Partner_ID },
      },
      {
        $lookup: {
          from: "vouchers",
          localField: "Voucher_ID",
          foreignField: "_id",
          as: "vouchers",
        },
      },
      {
        $lookup: {
          from: "havevouchers",
          localField: "Voucher_ID",
          foreignField: "Voucher_ID",
          as: "haveVouchers",
        },
      },
    ]);

    await redisClient.setEx(
      `Statistical:${Partner_ID}`,
      3600,
      JSON.stringify(Statistical)
    );

    // Send the result as the response
    res.status(200).json(Statistical);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: error.message }); // Send error response
  }
};

const StatisticalSort = async (req, res) => {
  try {
    const { month, year } = req.body;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const history = await HistoryDB.find({
      Date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    if (!history || history.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch sử cho tháng và năm này" });
    }

    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createHistory,
  Statistical_Voucher,
  Statistical_PartnerService,
  StatisticalSort,
  Statistical_VoucherFindPartner_Service,
  HistoryCus,
};
