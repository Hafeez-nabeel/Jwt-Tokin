const express = require("express");
const cors = require("cors");
const Port = 8000;
const app = express();
// integrate dotenv file
require("dotenv").config();
const db = require("./db");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// import users schema from model
const User = require("./models/userSchema");
app.use(cors());

// token authentication
function authentication(req, res, next) {
  const token = req.header("Authorization");
  console.log(token);
  const { id } = req.body;
  if (!token) {
    return res.status(401).json({ message: "Auth error" });
  }
  // now check if token is correct or not
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (id === decoded.id) {
      next();
    }
    // id = decoded.id;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "invalid token",
    });
  }
}

app.get("/", (req, res) => {
  res.send({
    message: "API is Connected",
  });
});
app.post("/register", async (req, res) => {
  try {
    // get users field from frontend/Postman
    const { user_name, password, email, age, gender } = req.body;

    // check if user already exist
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(409).json({
        message: "This email already exist try unique one",
      });
    }
    // if uses does not exist in databse
    /**
       1.use bcrypt to convert and  create secure passwrd
       */
    const salt = await bcrypt.genSalt(10);

    // normal password is converted to hashed password
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("This is salt: ", salt);
    console.log("This is hashed: ", hashedPassword);
    // create new user
    const newUser = new User({
      user_name,
      password: hashedPassword,
      email,
      age,
      gender,
    });
    await newUser.save();
    res.status(201).json({
      message: "new user created",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Login credential

app.post("/login", async (req, res) => {
  try {
    const { password, email } = req.body;
    const isUserExist = await User.findOne({ email });
    if (!isUserExist) {
      res.status(401).json({
        message: "Invalid Credential",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(password, isUserExist.password);

    if (!isPasswordCorrect) {
      res.status(401).json({
        message: "Invalid Credential",
      });
      return;
    }
    // genrate token
    const token = jwt.sign({ id: isUserExist._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.status(200).json({
      token,
      message: "User logged in Successfully",
    });
    return;
  } catch (error) {
    console.log(error);
  }
});

app.get("/getmyprofile", authentication, async (req, res) => {
  const { id } = req.body;
  const user = await User.findById(id);
  user.password = undefined;
  res.status(200).json({
    user,
  });
});
// Listening server
app.listen(Port, () => {
  console.log("Server is running on Port:", Port);
});
