const VoucherDB = require("../Schema/schema").Voucher;
const PartnerDB = require("../Schema/schema").Partner;
const ConditionDB = require("../Schema/schema").Condition;
const CounterCondition = require("../Schema/schema").counterCondition;
const HaveVoucherDB = require("../Schema/schema").HaveVoucher;
const CounterHaveVoucher = require("../Schema/schema").counterHaveVoucher;
const { z } = require("zod");
const redisClient = require("../Middleware/redisClient");

const ensureRedisConnection = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

const createVoucherbyAdmin = async (req, res) => {
  const voucherSchema = z
    .object({
      _id: z.string(),
      Name: z.string().min(1, "Name is required"),
      ReleaseTime: z
        .string()
        .refine((date) => new Date(date).getTime() > Date.now(), {
          message: "ReleaseTime phải sau thời gian hiện tại",
        }),
      ExpiredTime: z.string(),
      Description: z.string().optional(),
      Image: z.string().optional(),
      RemainQuantity: z.number().min(0, "RemainQuantity phải lớn hơn 0"),

      Conditions: z
        .array(
          z.object({
            MinValue: z.number().min(0, "MinValue phải lớn hơn 0"),
            MaxValue: z.number().min(0, "MaxValue phải lớn hơn 0"),
          })
        )
        .superRefine((conditions, ctx) => {
          conditions.forEach((condition, index) => {
            if (condition.MaxValue >= condition.MinValue) {
              ctx.addIssue({
                path: ["Conditions", index, "MaxValue"],
                message: "MaxValue phải nhỏ hơn MinValue",
              });
            }
          });
        }),
      PercentDiscount: z
        .number()
        .min(0, "PercentDiscount phải lớn hơn 0")
        .max(100, "PercentDiscount không được vượt quá 100"),
      HaveVouchers: z.array(
        z.object({
          Service_ID: z.string(),
        })
      ),
    })
    .superRefine((data, ctx) => {
      const { ReleaseTime, ExpiredTime } = data;

      if (new Date(ExpiredTime).getTime() <= new Date(ReleaseTime).getTime()) {
        ctx.addIssue({
          path: ["ExpiredTime"],
          message: "ExpiredTime phải sau ReleaseTime",
        });
      }
    });

  try {
    await ensureRedisConnection();
    const validatedData = voucherSchema.parse(req.body);
    const {
      _id,
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      Conditions,
      PercentDiscount,
      HaveVouchers,
    } = validatedData;

    const AmountUsed = 0;
    const States =
      new Date(ReleaseTime).getTime() === Date.now() ? "enable" : "disable";

    const reply = await redisClient.get(`voucher:${_id}`);
    if (reply) {
      return res.status(400).json({ message: "Voucher đã tồn tại" });
    }

    let min = Conditions[0].MinValue;

    for (const condition of Conditions) {
      const { MinValue, MaxValue } = condition;

      if (MaxValue > MinValue) {
        return res.status(400).json({
          message: "MaxValue phải nhỏ hơn MinValue",
        });
      }

      if (min > MinValue) {
        min = MinValue;
      }

      const counterCondition = await CounterCondition.findOneAndUpdate(
        { _id: "GenaralCondition" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const idCondition = `CD${counterCondition.seq}`;
      const newCondition = new ConditionDB({
        _id: idCondition,
        Voucher_ID: _id,
        MinValue,
        MaxValue,
      });

      await newCondition.save();
    }

    const voucher = new VoucherDB({
      _id,
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      States,
      AmountUsed,
      PercentDiscount,
      MinCondition: min,
    });

    await voucher.save();

    for (const haveVoucher of HaveVouchers) {
      const { Service_ID } = haveVoucher;
      const counterHaveVoucher = await CounterHaveVoucher.findOneAndUpdate(
        { _id: "GenaralHaveVoucher" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const idHaveVoucher = `HV${counterHaveVoucher.seq}`;
      const newHaveVoucher = new HaveVoucherDB({
        _id: idHaveVoucher,
        Voucher_ID: _id,
        Service_ID,
      });
      await newHaveVoucher.save();
    }

    await redisClient.setEx(`voucher:${_id}`, 3600, JSON.stringify(voucher));

    res.status(201).json({
      message: "Voucher và các điều kiện đã được tạo thành công",
      voucher: voucher,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//-------------------------------------------------create voucher by partner
const createVoucherbyPartner = async (req, res) => {
  const voucherSchema = z
    .object({
      _id: z.string(),
      Name: z.string().min(1, "Name is required"),
      ReleaseTime: z
        .string()
        .refine((date) => new Date(date).getTime() > Date.now(), {
          message: "ReleaseTime phải sau thời gian hiện tại",
        }),
      ExpiredTime: z.string(),
      Description: z.string().optional(),
      Image: z.string().optional(),
      RemainQuantity: z.number().min(0, "RemainQuantity phải lớn hơn 0"),

      Conditions: z
        .array(
          z.object({
            MinValue: z.number().min(0, "MinValue phải lớn hơn 0"),
            MaxValue: z.number().min(0, "MaxValue phải lớn hơn 0"),
          })
        )
        .superRefine((conditions, ctx) => {
          conditions.forEach((condition, index) => {
            if (condition.MaxValue >= condition.MinValue) {
              ctx.addIssue({
                path: ["Conditions", index, "MaxValue"],
                message: "MaxValue phải nhỏ hơn MinValue",
              });
            }
          });
        }),
      PercentDiscount: z
        .number()
        .min(0, "PercentDiscount phải lớn hơn 0")
        .max(100, "PercentDiscount không được vượt quá 100"),
      HaveVouchers: z.array(
        z.object({
          Service_ID: z.string(),
        })
      ),
    })
    .superRefine((data, ctx) => {
      const { ReleaseTime, ExpiredTime } = data;

      if (new Date(ExpiredTime).getTime() <= new Date(ReleaseTime).getTime()) {
        ctx.addIssue({
          path: ["ExpiredTime"],
          message: "ExpiredTime phải sau ReleaseTime",
        });
      }
    });

  try {
    await ensureRedisConnection();
    const validatedData = voucherSchema.parse(req.body);
    const {
      _id,
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      Conditions,
      PercentDiscount,
      HaveVouchers,
    } = validatedData;

    const AmountUsed = 0;
    const States =
      new Date(ReleaseTime).getTime() === Date.now() ? "enable" : "disable";

    const partner_ID = req.decoded?.partnerId;
    if (!partner_ID) {
      return res.status(400).json({ message: "Không tìm thấy partner_ID" });
    }

    const partner =
      (await PartnerDB.findById(partner_ID)) ||
      new PartnerDB({
        _id: partner_ID,
        Mail: req.decoded?.email,
      });

    await partner.save();

    const reply = await redisClient.get(`voucher:${_id}`);
    if (reply) {
      return res.status(400).json({ message: "Voucher đã tồn tại" });
    }

    let min = Conditions[0].MinValue;

    for (const condition of Conditions) {
      const { MinValue, MaxValue } = condition;

      if (MaxValue > MinValue) {
        return res.status(400).json({
          message: "MaxValue phải nhỏ hơn MinValue",
        });
      }

      if (min > MinValue) {
        min = MinValue;
      }

      const counterCondition = await CounterCondition.findOneAndUpdate(
        { _id: "GenaralCondition" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const idCondition = `CD${counterCondition.seq}`;
      const newCondition = new ConditionDB({
        _id: idCondition,
        Voucher_ID: _id,
        MinValue,
        MaxValue,
      });

      await newCondition.save();
    }

    const voucher = new VoucherDB({
      _id,
      Name,
      Partner_ID: partner_ID,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image,
      RemainQuantity,
      States,
      AmountUsed,
      PercentDiscount,
      MinCondition: min,
    });

    await voucher.save();

    for (const haveVoucher of HaveVouchers) {
      const { Service_ID } = haveVoucher;
      const counterHaveVoucher = await CounterHaveVoucher.findOneAndUpdate(
        { _id: "GenaralHaveVoucher" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const idHaveVoucher = `HV${counterHaveVoucher.seq}`;
      const newHaveVoucher = new HaveVoucherDB({
        _id: idHaveVoucher,
        Voucher_ID: _id,
        Service_ID,
      });
      await newHaveVoucher.save();
    }

    await redisClient.setEx(`voucher:${_id}`, 3600, JSON.stringify(voucher));

    res.status(201).json({
      message: "Voucher và các điều kiện đã được tạo thành công",
      voucher: voucher,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//-------------------------------------------------------------detailvoucher
const DetailVoucher = async (req, res) => {
  try {
    await ensureRedisConnection();
    const { _id } = req.params;

    const cacheDetail = await redisClient.get(`voucher:${_id}`);
    if (cacheDetail) {
      return res.json(JSON.parse(cacheDetail));
    }

    const vouchersWithDetails = await VoucherDB.aggregate([
      {
        $match: { _id },
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
          as: "haveVouchers",
        },
      },
    ]);
    await redisClient.setEx(
      `voucher:${_id}`,
      3600,
      JSON.stringify(vouchersWithDetails)
    );
    res.json(vouchersWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//---------------------------------------------------------------Update
const updateVoucher = async (req, res) => {
  const voucherSchema = z
    .object({
      ReleaseTime: z
        .string()
        .refine((date) => new Date(date).getTime() < Date.now(), {
          message: "ReleaseTime phải trước thời gian hiện tại",
        }),
      ExpiredTime: z.string(),
      Description: z.string().optional(),
      Image: z.string().optional(),
      RemainQuantity: z.number().min(0, "RemainQuantity phải lớn hơn 0"),
    })
    .superRefine((data, ctx) => {
      const { ReleaseTime, ExpiredTime } = data;

      if (new Date(ExpiredTime).getTime() <= new Date(ReleaseTime).getTime()) {
        ctx.addIssue({
          path: ["ExpiredTime"],
          message: "ExpiredTime phải sau ReleaseTime",
        });
      }
    });

  try {
    await ensureRedisConnection();
    const { _id } = req.params;
    const validatedData = voucherSchema.parse(req.body);
    const { ReleaseTime, ExpiredTime, Description, Image, RemainQuantity } =
      validatedData;

    const voucher = await VoucherDB.findById(_id);

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    voucher.ReleaseTime = ReleaseTime;
    voucher.ExpiredTime = ExpiredTime;
    voucher.Description = Description;
    voucher.Image = Image;
    voucher.RemainQuantity = RemainQuantity;

    await voucher.save();
    await redisClient.del(`voucher:${_id}`);

    res.json({
      message: "Voucher updated successfully and conditions are updated",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//---------------------------------------------------------delete voucher
const deleteVoucher = async (req, res) => {
  try {
    const { _id } = req.params;
    const voucher = await VoucherDB.findById(_id);

    if (!voucher) {
      return res.status(404).json({ message: " VoucherDB not found" });
    }
    voucher.States = "disable";
    await voucher.save();
    await redisClient.del(`voucher:${_id}`);
    res.json({ message: " VoucherDB deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//---------------------------------------get voucher by admin voucher lấy tất cả voucher để xem bởi admin
const getVoucherByAdmin = async (req, res) => {
  try {
    await ensureRedisConnection();
    const cacheKey = "vouchers:admin";

    const cachedVouchers = await redisClient.get(cacheKey);
    if (cachedVouchers) {
      return res.json(JSON.parse(cachedVouchers));
    }

    const vouchersWithDetails = await VoucherDB.aggregate([
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
          as: "haveVouchers",
        },
      },
    ]);

    if (vouchersWithDetails.length === 0) {
      return res.status(404).json({ message: "No vouchers found" });
    }
    await redisClient.setEx(
      cacheKey,
      3600,
      JSON.stringify(vouchersWithDetails)
    );
    res.json(vouchersWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//----------------------------------------------get voucher by partner ở trên web của mình
const getvoucherManagerbyPartner = async (req, res) => {
  try {
    await ensureRedisConnection();
    const Partner_ID = req.decoded.partnerId;
    const cachedVouchers = await redisClient.get(`vouchers:${Partner_ID}`);
    if (cachedVouchers) {
      return res.json(JSON.parse(cachedVouchers));
    }

    const voucher = await VoucherDB.aggregate([
      { $match: { Partner_ID: Partner_ID } },
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
          as: "haveVouchers",
        },
      },
    ]);
    await redisClient.setEx(
      `vouchers:${Partner_ID}`,
      3600,
      JSON.stringify(voucher)
    );
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//---------------------------------------updateState
const updateState = async (req, res) => {
  try {
    await ensureRedisConnection();
    const { _id } = req.params;
    const voucher = await VoucherDB.findById(_id);
    if (!voucher) {
      return res
        .status(404)
        .json({ message: "VoucherDB not found to update state" });
    }
    if (voucher.RemainQuantity == 0 || voucher.ReleaseTime > new Date()) {
      voucher.States = "disable";
      return res.status(400).json({
        message:
          "You cann't update state, when RemainQuantity=0 or ReleaseTime>now",
      });
    } else {
      voucher.States = voucher.States === "enable" ? "disable" : "enable";
    }

    await voucher.save();
    await redisClient.del(`voucher:${_id}`);

    res.status(200).json({ message: "State updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//----------------------------------------updateContdition
const updateCondition = async (req, res) => {
  const conditionSchema = z.object({
    MinValue: z.number().min(0, "MinValue phải lớn hơn 0"),
    MaxValue: z
      .number()
      .min(0, "MaxValue phải lớn hơn 0")
      .superRefine((conditions, ctx) => {
        conditions.forEach((condition, index) => {
          if (condition.MaxValue >= condition.MinValue) {
            ctx.addIssue({
              path: ["Conditions", index, "MaxValue"],
              message: "MaxValue phải nhỏ hơn MinValue",
            });
          }
        });
      }),
  });

  try {
    await ensureRedisConnection();
    const { _id } = req.params;
    const conditionNew = await ConditionDB.findById(_id);

    if (!conditionNew) {
      return res.status(404).json({ message: "Condition not found" });
    }

    const validatedCondition = conditionSchema.parse(req.body);
    const { MinValue, MaxValue } = validatedCondition;

    conditionNew.MinValue = MinValue;
    conditionNew.MaxValue = MaxValue;

    await conditionNew.save();

    await redisClient.del(`condition:${_id}`);

    res.json({
      message: "Condition updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createVoucherbyAdmin,
  createVoucherbyPartner,
  updateVoucher,
  deleteVoucher,
  getVoucherByAdmin,
  getvoucherManagerbyPartner,
  DetailVoucher,
  updateState,
  updateCondition,
};
