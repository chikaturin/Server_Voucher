const express = require("express");
const app = express();
const data = require("./Data/data.js");
const cors = require("cors");

app.use(cors());
app.use(express.json());
const PORT = 3000;

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/", (req, res) => {
  res.json("Welcome to Voucher Management System");
});

app.use("/api", require("./Router/AccountRouter.js"));
app.use("/api", require("./Router/VoucherRouter.js"));
app.use("/api", require("./Router/ReportRouter.js"));
app.use("/api", require("./Router/PayRouter.js"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
