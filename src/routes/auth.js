const express = require("express");
const authRouter = express.Router();
const { validateSignup } = require("../utlis/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
authRouter.use(cookieParser());
authRouter.use(express.json()); // Middleware to parse JSON request bodies -> will be available for all routes

let isUserLoggedIn = false;
//SIGNUP API
authRouter.post("/signup", async (req, res) => {
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
authRouter.post("/login", async (req, res) => {
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
      isUserLoggedIn = true;
      return res.send("Logged In!", token);
    } else {
      res.send("Invalid credentials!");
    }
  } catch (error) {
    console.error("err: ", error.message);
    isUserLoggedIn = false;
    return res.status(500).send(error.message);
  }
});

//GET ALL USERS API
authRouter.get("/list/users", async (req, res) => {
  try {
    const users = await User.find(); // Find all users in the database, Users- model is used to query the database
    res.status(200).json({ users });
  } catch (error) {
    console.log("Failed to fetch users:", error.message);
    res.status(500).json({ message: "Unable to fetch users" });
  }
});

//GET BY EMAIL ID
authRouter.get("/user", userAuth, async (req, res) => {
  try {
    const emailId = req.body.email;
    const users = await User.find({ email: emailId });
    res.status(200).json({ users });
  } catch (error) {
    console.log("email id not found: ", error);
  }
});

//delete by Id
authRouter.delete("/user", async (req, res) => {
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
authRouter.patch("/user", async (req, res) => {
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

authRouter.post("/logout", async (req, res) => {
  try {
    if (!isUserLoggedIn) {
      throw new Error("User is not logged in!");
    }
    res.clearCookie("token");
    res.send("Logged Out !!");
  } catch (error) {
    console.error("error: ", error);
    res.status(500).send("Unable to log out");
  }
});

module.exports = authRouter;
