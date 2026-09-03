const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const bcrypt = require("bcrypt");

let userProfile = {};

//PROFILE API
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    // console.log("user; ", user);
    userProfile = user;
    res.send(user);
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(401).send("Invalid or expired token");
  }
});

// profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
//   const userId = req.body._id;
//   const data = req.body;
//   console.log(userId);

//   try {
//     const ALLOWED_UPDATES = ["password", "age", "gender", "skills"];
//     const isUpdateAllowed = Object.keys(data).every((k) =>
//       ALLOWED_UPDATES.includes(k),
//     );
//     if (!isUpdateAllowed) {
//       throw new Error("Update not allowed");
//     }
//     const updatedUser = await User.findByIdAndUpdate(userId, data, {
//       runValidators: true,
//     });
//     // Block emailId update
//     if (data.emailId) {
//       return res.status(400).json({
//         message: "Email ID cannot be updated",
//       });
//     }
//     console.log("udpated user: ", updatedUser);
//     //res.send("user with id: ", req.body._id, " updated successfully!");
//     res.status(200).json({
//       message: "User updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//     console.error("update failed:", error);
//   }
// });

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const ALLOWED_UPDATES = ["password", "age", "gender", "skills"];

    const isUpdateAllowed = Object.keys(req.body).every((key) =>
      ALLOWED_UPDATES.includes(key),
    );

    if (!isUpdateAllowed) {
      return res.status(400).json({
        message: "Update not allowed",
      });
    }

    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update failed:", error.message);

    return res.status(500).json({
      message: error.message,
    });
  }
});

//FORGOT PWD API- create new one
// FORGOT / RESET PASSWORD API
profileRouter.patch("/profile/newPwd", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).send("Password is required");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update only the password
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
      },
      {
        new: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    return res.status(200).json({
      message: "New password created successfully!",
    });
  } catch (error) {
    console.error("Error:", error.message);

    return res.status(500).send("Unable to update password");
  }
});

module.exports = profileRouter;
