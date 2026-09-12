const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();
const USER_SAFE_DATA = "name age gender skills";

// userRouter.get("/user/requests", userAuth, async (req, res) => {
//   try {
//     const loggedInUser = req.user;
//     const connectionRequests = await ConnectionRequest.find({
//       toUserId: loggedInUser._id,
//     });
//     const data = await connectionRequests.save();
//     res.status(200).json({
//       message: "Fetched all connection requests successfully: ",
//       data: connectionRequests,
//     });
//   } catch (error) {
//     res.status(400).json({ message: "Unable to fetch requests" });
//     console.error("error: ", error);
//   }
// });

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "intrested",
    }).populate("fromUserId", [
      "name",
      "photoUrl",
      "age",
      "about",
      "skills",
      "gender",
    ]); // if you dont mention["name", "email"] then it will simply send all attributes of user

    res.status(200).json({
      message: "Fetched all connection requests successfully",
      data: connectionRequests,
    });
  } catch (error) {
    console.error("error:", error);

    res.status(400).json({
      message: "Unable to fetch requests",
    });
  }
});

userRouter.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionReqs = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    const data = connectionReqs.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    // const data = await connectionReqs.save();
    // res.send("Connection reqs: " + data);
    res.json({ data: connectionReqs });
  } catch (error) {
    console.error("error: ", error);
    res.status(400).json({ message: "No connection requests found!" });
  }
});
module.exports = userRouter;
