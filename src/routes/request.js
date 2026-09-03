const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const requestRouter = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");

requestRouter.post("sendConnectionRew", userAuth, async (req, res) => {
  try {
    const user = req.user;
    console.log("sending connection request");
    res.send(user.name + " -> send first name");
  } catch (error) {
    console.log("error: ", error);
    res.status(500).send("connection req failed");
  }
});

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      // const toUserId = req.params.toUserId;
      const status = req.params.status;
      const fromUserId = req.user._id;
      const toUserId = new mongoose.Types.ObjectId(req.params.toUserId);

      const allowedStatus = ["intrested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send("invalid status type: " + status);
      }
      if (toUserId.equals(fromUserId)) {
        return res
          .status(400)
          .send("ARE YOU DUMB? you cannot send req to yourself");
      }

      //CHECK IF REQUEST ALREADY EXISTS OR IF A HAS SENT REQ TO B, THEN B CANT AGAIN SEND TO A
      const existingConnectionReq = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionReq) {
        return res
          .status(400)
          .send("CHILL OUT! this connection request already exists");
      }

      //CHECK IF TOUSERID IS PRESENT IN DB
      const toUserIdExists = await User.findOne(toUserId);
      if (!toUserIdExists) {
        res.status(400).send("OUT OF LEAGUE !! toUser is not in our DB");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      res.json({ message: "Connnection request sent successfully!", data });
    } catch (error) {
      res.status(400).send(`Unable to send connection req: ${error.message}`);
      //res.send() only accepts one body argument.
      console.error("error:: ", error);
    }
  },
);

module.exports = requestRouter;
