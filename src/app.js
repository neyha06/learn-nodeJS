const express = require("express");
const connectDatabase = require("./config/database");
const mongoose = require("mongoose");
const { validateSignup } = require("./utlis/validation");
const bcrypt = require("bcrypt");
var validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

const app = express();
const PORT = process.env.PORT || 3000;

const User = require("./models/user");

app.use(express.json()); // Middleware to parse JSON request bodies -> will be available for all routes
app.use(cookieParser());

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("DB connection failed:", error.message);
  });

//SIGNUP API
app.post("/signup", async (req, res) => {
  console.log("Request body:", req.body); // Log the request body to see what data is being sent
  try {
    // const userObject = {
    //   name: "user 1",
    //   email: "apple@gmail.com",
    //   password: "user@123",
    // };
    // if (!validator.isEmail(req.body.email)) {
    //   res
    //     .status(500)
    //     .json({ message: "Invalid Credentials! Unable to add user" });
    // }

    //validation
    validateSignup(req.body);

    //encryption
    const { name, email, password, gender, age } = req.body;
    const hasspwd = await bcrypt.hash(password, 10);
    console.log("hass pasword: ", hasspwd);

    const userObject = req.body; // Get the user data from  the request body
    const user = new User({ name, email, password: hasspwd, gender, age }); //creating new instance of user model
    await user.save(); //saving the user instance to the database

    res.status(201).json({ message: "User added successfully!" });
  } catch (error) {
    console.error("Signup failed:", error.message);
    res.status(400).send("Unable to add user: " + error.message);
  }
});

//LOGIN API
app.post("/login", async (req, res) => {
  try {
    const { password, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.send("Invalid creds!");
    }
    console.log("password", password, "     user", user);
    const isPwdValid = await bcrypt.compare(password, user.password);
    console.log("isPwdValid: ", isPwdValid);
    if (isPwdValid) {
      //create JWT token
      const token = jwt.sign({ _id: user._id }, "shhhhh@123", {
        expiresIn: "3h",
      });

      res.cookie("token", token);
      return res.send("Logged In!", token);
    } else {
      res.send("Invalid credentials!");
    }
  } catch (error) {
    console.error("err: ", error.message);
    return res.status(500).send(error.message);
  }
});

//PROFILE API
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    // console.log("user; ", user);
    res.send(user);
  } catch (error) {
    console.error("Profile error:", error.message);
    return res.status(401).send("Invalid or expired token");
  }
});

//GET ALL USERS API
app.get("/list/users", async (req, res) => {
  try {
    const users = await User.find(); // Find all users in the database, Users- model is used to query the database
    res.status(200).json({ users });
  } catch (error) {
    console.log("Failed to fetch users:", error.message);
    res.status(500).json({ message: "Unable to fetch users" });
  }
});

//GET BY EMAIL ID
app.get("/user", userAuth, async (req, res) => {
  try {
    const emailId = req.body.email;
    const users = await User.find({ email: emailId });
    res.status(200).json({ users });
  } catch (error) {
    console.log("email id not found: ", error);
  }
});

//delete by Id
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  console.log(userId);
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    console.log("deleted user: ", deletedUser);
    res.send("user with id: ", userId, " deleted successfully!");
  } catch (error) {
    res.status(500).json({ message: error });
    console.error("delete failed:", error.message);
  }
});

//UPDATE BY ID
app.patch("/user", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;
  console.log(userId);

  try {
    const ALLOWED_UPDATES = ["name", "password", "age", "gender"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k),
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      runValidators: true,
    });
    // Block emailId update
    if (data.emailId) {
      return res.status(400).json({
        message: "Email ID cannot be updated",
      });
    }
    console.log("udpated user: ", updatedUser);
    //res.send("user with id: ", req.body._id, " updated successfully!");
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("update failed:", error);
  }
});
