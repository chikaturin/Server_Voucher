const Voucher = require("../Schema/schema").Voucher;
const History = require("../Schema/schema").History;
const HaveVoucher = require("../Schema/schema").HaveVoucher;
const Condition = require("../Schema/schema").Condition;
const CounterHistory = require("../Schema/schema").counterHistory;
const PersonalDB = require("../Schema/schema").Personal;
const VoucherCusDB = require("../Schema/schema").VoucherCus;
const NoteDB = require("../Schema/schema").Note;
const redisClient = require("../Middleware/redisClient");

let numRedis = 0;

const ensureRedisConnection = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};
require("dotenv").config();

const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-producer",
  brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
});

const producer = kafka.producer();

const run = async (status, infor) => {
  let timeElapsed = 0;
  await producer.connect();

  while (timeElapsed < 300000 && status !== 200 && status !== 400) {
    await producer.send({
      topic: "useVoucher",
      messages: [
        {
          value: "USING",
          headers: {
            key: "__TypeId__",
            value: "com.wowo.wowo.kafka.messages.UseVoucherMessage",
          },
        },
      ],
    });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    timeElapsed += 10000;
  }

  if (status === 200) {
    await producer.send({
      topic: "useVoucher",
      messages: [
        {
          value: JSON.stringify(infor),
          headers: {
            " _TypeId_": "com.wowo.wowo.kafka.messages.UseVoucherMessage",
          },
        },
      ],
    });
  } else if (status === 400) {
    await producer.send({
      topic: "useVoucher",
      messages: [
        {
          value: "FAILED",
          headers: {
            " _TypeId_": "com.wowo.wowo.kafka.messages.UseVoucherMessage",
          },
        },
      ],
    });
  } else if (timeElapsed >= 300000) {
    await producer.send({
      topic: "useVoucher",
      messages: [
        {
          value: "OVER TIME",
          headers: {
            key: __TypeId__,
            value: com.wowo.wowo.kafka.messages.UseVoucherMessage,
          },
        },
      ],
    });
  }

  await producer.disconnect();
};

const consumer = kafka.consumer({ groupId: "my-consumer" });

const runconsumer = async (Voucher_ID, CusID, TotalDiscount) => {
  await consumer.connect();
  await consumer.subscribe({ topic: "useVoucher", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.value.toString() === "Success") {
        const counterID = await CounterHistory.findOneAndUpdate(
          { _id: "Statistical" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        const _idhis = `HIS${counterID.seq}`;

        const history = new History({
          _id: _idhis,
          Voucher_ID,
          CusID,
          TotalDiscount,
          Date: new Date(),
        });
        await history.save();
        console.log(`Saved history with ID: ${_idhis}`);
      }
    },
  });
};

const CalculateVoucher = async (req, res) => {
  try {
    const { _id, Price } = req.body;

    const voucher = await Voucher.findOne({ _id });
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    const conditions = await Condition.find({ Voucher_ID: voucher._id });

    if (!conditions.length) {
      return res
        .status(404)
        .json({ message: "No conditions found for this voucher" });
    }

    let max = -Infinity;
    let selectedCondition = null;

    for (const condition of conditions) {
      if (condition.MinValue <= Price && condition.MinValue > max) {
        max = condition.MinValue;
        selectedCondition = condition;
      }
    }

    const VoucherID = selectedCondition.Voucher_ID;
    const PercentDiscount = await Voucher.findOne({ _id: VoucherID });

    if (!selectedCondition) {
      return res.status(404).json({ message: "No applicable condition found" });
    }

    let priceDiscount = 0;
    let discount = (PercentDiscount.PercentDiscount * Price) / 100;

    if (discount <= selectedCondition.MaxValue) {
      priceDiscount = discount;
    } else {
      priceDiscount = selectedCondition.MaxValue;
    }
    res.status(200).json(priceDiscount);
  } catch (error) {
    console.error("Error calculating voucher:", error);
    res.status(400).json({ message: error.message });
  }
};

const CheckPoint = async (req, res) => {
  try {
    const CusID = req.decoded?.id;
    const personal = await PersonalDB.findOne({ CusID });
    if (!personal) {
      const personalcreate = new PersonalDB({
        CusID,
        Point: 0,
      });
      await personalcreate.save();
    }
    res.status(200).json(personal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const CheckVoucher = async (req, res) => {
  try {
    await ensureRedisConnection();
    const CusID = req.decoded?.id;
    const { Service_ID } = req.decoded?.PartnerService.serviceId;
    await redisClient.del(`vouchers:${CusID}:${Service_ID}`);
    const cacheKey = `vouchers:${CusID}:${Service_ID}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const havevoucher = await HaveVoucher.find({ Service_ID });
    const voucherCus = await VoucherCusDB.findOne({ CusID });

    if (!havevoucher.length) {
      return res.status(404).json({ message: "HaveVoucher not found" });
    }

    const voucherIDs = havevoucher.map((v) => v.Voucher_ID);
    let vouchers = [];

    if (voucherCus?.Voucher_ID && voucherIDs.includes(voucherCus.Voucher_ID)) {
      const personalVoucherData = await Voucher.aggregate([
        {
          $match: {
            _id: voucherCus.Voucher_ID,
          },
        },
        {
          $lookup: {
            from: "conditions",
            localField: "_id",
            foreignField: "Voucher_ID",
            as: "conditions",
          },
        },
      ]);

      if (personalVoucherData.length > 0) {
        vouchers.push(...personalVoucherData);
      }
    }

    const otherVouchers = await Voucher.aggregate([
      {
        $match: {
          _id: { $in: voucherIDs },
          States: "Enable",
          Partner_ID: null,
        },
      },
      {
        $lookup: {
          from: "conditions",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "conditions",
        },
      },
    ]);

    vouchers.push(...otherVouchers);

    const uniqueVouchers = Array.from(
      new Map(vouchers.map((v) => [v._id, v])).values()
    );

    if (!uniqueVouchers.length) {
      return res
        .status(404)
        .json({ message: "Voucher or conditions not found" });
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(uniqueVouchers));

    res.status(200).json(uniqueVouchers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const ReceiveVoucher = async (req, res) => {
  try {
    const CusID = req.decoded?.id;
    const { Service_ID } = req.body;

    let havevouchers = await HaveVoucher.find({ Service_ID });
    if (!havevouchers.length) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }

    let personalVoucher = await PersonalDB.findOne({ CusID });
    if (!personalVoucher) {
      personalVoucher = new PersonalDB({
        CusID,
        Point: 0,
      });
    }

    if (personalVoucher.Point < 100) {
      return res.status(400).json({ message: "Không đủ điểm" });
    }

    const receivedVouchers = await VoucherCusDB.find({ CusID });

    havevouchers = havevouchers.filter(
      (voucher) =>
        !receivedVouchers.some(
          (received) => received.Voucher_ID === voucher.Voucher_ID
        )
    );

    let randomIndex;
    let selectedVoucher;
    let voucher;
    do {
      randomIndex = Math.floor(Math.random() * havevouchers.length);
      selectedVoucher = havevouchers[randomIndex];
      voucher = await Voucher.findById(selectedVoucher.Voucher_ID);

      havevouchers = havevouchers.filter(
        (v) => v.Voucher_ID !== selectedVoucher.Voucher_ID
      );

      if (!havevouchers.length) {
        return res
          .status(400)
          .json({ message: "Tất cả các voucher đã được nhận" });
      }
    } while (voucher.RemainQuantity < 1);

    voucher = await Voucher.findByIdAndUpdate(
      selectedVoucher.Voucher_ID,
      { $inc: { RemainQuantity: -1 } },
      { new: true }
    );

    if (!voucher) {
      return res.status(404).json({ message: "Không tìm thấy voucher" });
    }

    let voucherCus = new VoucherCusDB({
      CusID,
      Voucher_ID: selectedVoucher.Voucher_ID,
    });

    await voucherCus.save();

    personalVoucher.Point -= 100;
    await personalVoucher.save();

    return res.status(200).json(voucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const ApplyVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const CusID = req.decoded?.email;
    const { TotalDiscount, Price, OrderID } = req.body;

    let personalVoucher = await PersonalDB.findOne({ CusID });
    let voucherCus = await VoucherCusDB.findOne({ CusID, Voucher_ID: _id });
    const voucherName = await Voucher.findById(_id);

    const Point = Price / 100000;

    if (!personalVoucher) {
      personalVoucher = new PersonalDB({
        CusID,
        Point,
      });
      await personalVoucher.save();
    } else {
      personalVoucher.Point += Point;
      await personalVoucher.save();
    }

    let voucher;

    if (voucherCus && voucherCus.Voucher_ID == _id) {
      await VoucherCusDB.findByIdAndDelete(voucherCus._id);
      voucher = await Voucher.findByIdAndUpdate(
        _id,
        { $inc: { AmountUsed: 1 } },
        { new: true }
      );
    } else {
      voucher = await Voucher.findByIdAndUpdate(
        _id,
        { $inc: { RemainQuantity: -1, AmountUsed: 1 } },
        { new: true }
      );

      if (!voucher) {
        await run(400, "FAILED");
        return res.status(404).json({ message: "Voucher not found" });
      }

      if (voucher.RemainQuantity < 1) {
        await run(400, "FAILED");
        await Voucher.findByIdAndUpdate(_id, { $set: { States: "Disable" } });
        return res
          .status(400)
          .json({ message: "Voucher quantity is insufficient" });
      }
    }

    runconsumer(_id, CusID, TotalDiscount).catch(console.error);

    const Infor = {
      VoucherID: _id,
      VoucherName: voucherName.Name,
      Discount: TotalDiscount,
      OrderID: OrderID,
      Price: Price - TotalDiscount,
    };

    numRedis = Math.floor(Math.random() * 100);

    console.log("Apply voucher successfully", Infor);

    await run(200, Infor);
    console.log("Apply voucher successfully", Infor);

    res.status(200).json({ message: "Apply voucher successfully" });
  } catch (error) {
    await run(400, "FAILED");
    res.status(400).json({ message: error.message });
  }
};

const getVoucherByCus = async (req, res) => {
  try {
    const CusID = req.decoded?.email;
    console.log("Get voucher by customer", CusID);
    const { Service_ID, Partner_ID, Price } = req.body;
    const numericPrice = Number(Price);

    const CusIDCheck = await History.find({ CusID });
    const usedVoucherIds = CusIDCheck.map((item) => item.Voucher_ID);
    const usedDates = CusIDCheck.reduce((acc, check) => {
      acc[check.Voucher_ID] = check.Date;
      return acc;
    }, {});

    const listVoucher = await Voucher.aggregate([
      {
        $match: {
          States: "Enable",
          $or: [{ Partner_ID: Partner_ID }, { Partner_ID: null }],
          MinCondition: { $lte: numericPrice },
        },
      },
      {
        $lookup: {
          from: "conditions",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "conditions",
        },
      },
      {
        $lookup: {
          from: "havevouchers",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "havevouchers",
        },
      },
      {
        $match: {
          "havevouchers.Service_ID": Service_ID,
          $expr: {
            $cond: {
              if: { $gte: ["$ReleaseTime", usedDates[`$_id`]] },
              then: true,
              else: { $not: { $in: ["$_id", usedVoucherIds] } },
            },
          },
        },
      },
    ]);

    res.status(200).json(listVoucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const RequireVoucher = async (req, res) => {
  try {
    const { Service_ID, Partner_ID, Price, OrderID } = req.body;

    const Note = new NoteDB({
      Service_ID,
      Partner_ID,
      Price,
      OrderID,
    });

    await Note.save();

    run(0, "START").catch(console.error);

    res.status(200).json({ message: "Connect successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const GetNote = async (req, res) => {
  try {
    const { OrderID } = req.params;
    const notes = await NoteDB.findOne({ OrderID });
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { OrderID } = req.params;
    await NoteDB.deleteOne({ OrderID });
    res.status(200).json({ message: "Delete successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

process.on("SIGINT", async () => {
  await producer.disconnect();
  process.exit(0);
});

module.exports = {
  CalculateVoucher,
  ApplyVoucher,
  getVoucherByCus,
  CheckVoucher,
  ReceiveVoucher,
  CheckPoint,
  RequireVoucher,
  GetNote,
  deleteNote,
};
