const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async (req, res, next) => {
  try {
    //read tokem from rer cookies
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid token");
    }

    //validate token
    const decodedObj = await jwt.verify(token, "shhhhh@123");
    const { _id } = decodedObj;

    // //find user
    const user = await User.findById(_id);
    //console.log("user from auth: ", user);

    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next(); // its called to move to next req handler
  } catch (error) {
    console.error("err: ", error);
    res.status(400).send("bad req: ", error.message);
  }
};
module.exports = {
  userAuth,
};
