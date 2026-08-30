// connection string:
// mongodb+srv://kadamneha2002_db_user:5vOw0ffqBU5LhI5T@cluster0.ivfvbqk.mongodb.net/?appName=Cluster0

const mongoose = require("mongoose");

const connectDatabase = async () => {
  await mongoose.connect(
    "mongodb+srv://kadamneha2002_db_user:nehadb01@cluster0.ivfvbqk.mongodb.net/nehadb01",
  );
};

module.exports = connectDatabase;

// const path = require("path");
// require("dotenv").config({
//   path: path.resolve(__dirname, "../../.env"),
// });

// const mongoose = require("mongoose");

// const connectDatabase = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("Database connected");
//   } catch (error) {
//     console.error("Database connection failed:", error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDatabase;
