const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //this line says this is userId is the userId from User Model/table
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["intrested", "ignored", "accepted", "rejected"],
        message: "${VALUE} is incorrect status type",
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

connectionRequestSchema.index({ fromUserId: 1 }); //COMPOUND INDEX

connectionRequestSchema.pre("save", function () {
  const connectionRequest = this;
}); //its like a middleware- it will be called every time a connection req will be saved
const ConnectionRequest = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);
module.exports = ConnectionRequest;
