// connection string:
// mongodb+srv://kadamneha2002_db_user:5vOw0ffqBU5LhI5T@cluster0.ivfvbqk.mongodb.net/?appName=Cluster0

const mongoose = require("mongoose");

const connectDatabase = async () => {
  await mongoose.connect(
    "mongodb+srv://kadamneha2002_db_user:nehadb@cluster0.ivfvbqk.mongodb.net/nehadb01",
  );
};

module.exports = connectDatabase;
