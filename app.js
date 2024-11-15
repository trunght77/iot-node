const express = require("express");
const app = express();
const iotRoutes = require("./routes/iotRoutes");

app.use(express.json());

// Thiết lập API route
app.use("/api", iotRoutes);

// Khởi chạy server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
