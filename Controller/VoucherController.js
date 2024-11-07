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
      RemainQuantity: z.number().min(0, "RemainQuantity phải lớn hơn 0"),

      Conditions: z.array(
        z.object({
          MinValue: z.number().min(0, "MinValue phải lớn hơn 0"),
          MaxValue: z.number().min(0, "MaxDiscount phải lớn hơn 0"),
        })
      ),
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
          message: "MaxDiscount phải nhỏ hơn MinValue",
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

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng tải lên hình ảnh." });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "File hình ảnh không được tải lên r nè" });
    }

    console.log(req.file);

    const imageUrl = req.file.path;
    console.log("Image uploaded:", imageUrl);

    const voucher = new VoucherDB({
      _id,
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
      Image: imageUrl,
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
      RemainQuantity: z.coerce.number().min(0, "RemainQuantity phải lớn hơn 0"),
      Conditions: z.array(
        z.object({
          MinValue: z.coerce.number().min(0, "MinValue phải lớn hơn 0"),
          MaxValue: z.coerce.number().min(0, "MaxDiscount phải lớn hơn 0"),
        })
      ),
      PercentDiscount: z.coerce
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
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng tải lên hình ảnh." });
    }
    const imageUrl = req.file.path;
    const validatedData = voucherSchema.parse(req.body);
    const {
      _id,
      Name,
      ReleaseTime,
      ExpiredTime,
      Description,
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
      Image: imageUrl,
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

    await redisClient.del(`voucher:${_id}`);

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

    if (!vouchersWithDetails.length) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }

    await redisClient.setEx(
      `voucher:${_id}`,
      3600,
      JSON.stringify(vouchersWithDetails[0])
    );

    res.json(vouchersWithDetails[0]);
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
        .refine((date) => new Date(date).getTime() > Date.now(), {
          message: "ReleaseTime phải sau thời gian hiện tại",
        }),
      ExpiredTime: z.string(),
      Description: z.string().optional(),
      RemainQuantity: z.coerce.number().min(0, "RemainQuantity phải lớn hơn 0"),
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
    const { ReleaseTime, ExpiredTime, Description, RemainQuantity } =
      validatedData;

    const voucher = await VoucherDB.findById(_id);

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    voucher.ReleaseTime = ReleaseTime;
    voucher.ExpiredTime = ExpiredTime;
    voucher.Description = Description;
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

const GetVoucherWithService = async (req, res) => {
  try {
    await ensureRedisConnection();
    const { Service_ID } = req.params;
    const partnerId = req.decoded?.partnerId;

    if (!partnerId) {
      return res.status(400).json({ message: "Partner ID is required" });
    }

    console.log("Service_ID:", Service_ID, "Partner_ID:", partnerId);

    const cacheKey = `vouchers:${Service_ID}-${partnerId}`;
    await redisClient.del(cacheKey);

    const cachedVouchers = await redisClient.get(cacheKey);
    if (cachedVouchers) {
      return res.json(JSON.parse(cachedVouchers));
    }

    const voucherWithService = await VoucherDB.aggregate([
      {
        $lookup: {
          from: "havevouchers",
          localField: "_id",
          foreignField: "Voucher_ID",
          as: "havevouchers",
        },
      },
      {
        $unwind: "$havevouchers",
      },
      {
        $match: {
          "havevouchers.Service_ID": Service_ID,
          Partner_ID: partnerId,
        },
      },
    ]);

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(voucherWithService));

    if (voucherWithService.length === 0) {
      return res.status(201).json({ message: "No vouchers found" });
    }

    res.json(voucherWithService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//----------------------------------------------get voucher by partner ở trên web của mình
const getvoucherManagerbyPartner = async (req, res) => {
  try {
    await ensureRedisConnection();
    const Partner_ID = req.decoded.partnerId;

    await redisClient.del(`vouchers:${Partner_ID}`);

    const cachedVouchers = await redisClient.get(`vouchers:${Partner_ID}`);
    if (cachedVouchers) {
      return res.json(JSON.parse(cachedVouchers));
    }

    const voucher = await VoucherDB.aggregate([
      { $match: { Partner_ID: Partner_ID, States: { $ne: "deleted" } } },
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

    // Update cache
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

const deleteVoucher = async (req, res) => {
  try {
    const { _id } = req.params;

    const voucher = await VoucherDB.findById(_id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    await ensureRedisConnection();

    await redisClient.del(`voucher:${_id}`);
    await redisClient.del(`vouchers:${voucher.Partner_ID}`);

    voucher.States = "deleted";
    await voucher.save();

    res.json({ message: "Voucher deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
        message: `You cann't update state, when RemainQuantity=0 or ${
          voucher.ReleaseTime
        }<${new Date()}`,
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
    MinValue: z.coerce.number().min(0, "MinValue phải lớn hơn 0"),
    MaxValue: z.coerce.number().min(0, "MaxValue phải lớn hơn 0"),
  });

  try {
    const { _id } = req.params;
    const conditionToUpdate = await ConditionDB.findById(_id);

    if (!conditionToUpdate) {
      return res.status(400).json({ message: "Condition not found" });
    }

    const validatedCondition = conditionSchema.parse(req.body);
    const { MinValue, MaxValue } = validatedCondition;

    conditionToUpdate.MinValue = MinValue;
    conditionToUpdate.MaxValue = MaxValue;

    await conditionToUpdate.save();

    res.json({ message: "Condition updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const findcondition = async (req, res) => {
  const { _id } = req.params;
  const condition = await ConditionDB.findOne({ _id });
  if (!condition) {
    return res.status(404).json({ message: "Condition not found" });
  }
  res.json(condition);
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
  GetVoucherWithService,
  findcondition,
};
