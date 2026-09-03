const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true, //mongooose automatically creates index for you
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          // Standard RFC 5322 compliant email regex
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
      max: 60,
    },
    photoUrl: {
      type: String,
    },
    about: {
      type: String,
      default: "this is default string",
    },
    skills: {
      type: [String],
      required: [true, "Why no skills?"],
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "trans"].includes(value)) {
          throw new Error("Congrats you are Gay!");
        }
      },
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
