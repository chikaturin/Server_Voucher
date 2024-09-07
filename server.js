const express = require("express");
const app = express();
const data = require("./Data/data.js");

app.use(express.json());
const PORT = 3000;

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const Book = [
  {
    id: 1,
    name: "book1",
  },
  {
    id: 2,
    name: "book2",
  },
  {
    id: 3,
    name: "book3",
  },
];

app.get("/", (req, res) => {
  res.json({ status: "Welcome to Voucher Management System", data: Book });
});

app.use("/api", require("./Router/AccountRouter.js"));
app.use("/api", require("./Router/GenaralVoucherRouter.js"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
