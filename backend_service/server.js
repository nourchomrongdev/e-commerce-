const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Digital Products Marketplace API is running!"
  });
});

app.get("/api/products", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Website Template",
      price: 15
    },
    {
      id: 2,
      name: "E-Book",
      price: 10
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});