// const connectDatabase = require("./config/database");

// console.log("Hello, !");

// connectDatabase()
//   .then(() => console.log("Database connected successfully!"))
//   .catch((error) =>
//     console.error("Database connection failed:", error.message),
//   );

const express = require("express");
const connectDatabase = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

const User = require("./models/user");

app.use(express.json()); // Middleware to parse JSON request bodies -> will be available for all routes

app.post("/signup", async (req, res) => {
  console.log("Request body:", req.body); // Log the request body to see what data is being sent
  // try {
  //   const userObject = {
  //     name: "user 1",
  //     email: "apple@gmail.com",
  //     password: "user@123",
  //   };
  //   const user = new User(userObject); //creating new instance of user model
  //   await user.save(); //saving the user instance to the database

  //   res.status(201).json({ message: "User added successfully!" });
  // } catch (error) {
  //   console.error("Signup failed:", error.message);
  //   res.status(500).json({ message: "Unable to add user" });
  // }
});

connectDatabase()
  .then(() => {
    console.log("Database connected successfully!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exitCode = 1;
  });
