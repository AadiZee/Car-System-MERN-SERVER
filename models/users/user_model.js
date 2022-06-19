//to use mongoose to handle mongoDB queries
const mongoose = require("mongoose");
//to hash user passwords
const bcrypt = require("bcrypt");
//to generate tokens
const jwt = require("jsonwebtoken");
//to validate fields
const validator = require("validator");
//to declare environment variables
require("dotenv").config();

//to user declare schema for mongoDB using mongoose
const userSchema = mongoose.Schema({
  //we define what the email will be
  email: {
    //email is string
    type: String,
    //email is required field
    required: true,
    //email should be unique
    unique: true,
    //no whitespaces
    trim: true,
    //lowercased
    lowercase: true,
    //validator to validate if email. we can also use regex or YUP
    validator(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  //we define what password field will be
  password: {
    //password will be string
    type: String,
    //passwords are mandatory
    required: true,
    //no whitespaces
    trim: true,
  },
});

//this method is run everytime before adding/updating user data
userSchema.pre("save", async function (next) {
  let user = this;
  //to check if user password was modified
  //will also work for new record adding
  if (user.isModified("password")) {
    //if modified we generate a new bcrypt salt
    const salt = await bcrypt.genSalt(10);
    //we hash the password based on salt and password
    const hash = await bcrypt.hash(user.password, salt);
    //we set the password equal to hash so that hash is saved as password in user database
    user.password = hash;
  }
  //we continue with response
  next();
});

//to check if email is already present in database
userSchema.statics.emailTaken = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

//this method is used to compare hashed password from database with password entered by user
userSchema.methods.comparePassword = async function (candidatePassword) {
  const user = this;
  //here we match the passwords using bcrypt
  const match = await bcrypt.compare(candidatePassword, user.password);
  //we return the match result
  return match;
};

//this method is used to generateRegistrationToken
userSchema.methods.generateRegisterToken = function () {
  let user = this;
  //we declare the user object which will be used in order to generate token
  const userObj = { _id: user._id.toHexString(), email: user.email };
  //here we use jwt to generate token based on user object and secret phrase defined by us and define the expiring time.
  //secret is defined as an environment variable
  const token = jwt.sign(userObj, process.env.DB_SECRET, { expiresIn: "1d" });
  //we return the generated token
  return token;
};

// to generate a new token
userSchema.methods.generateToken = function () {
  let user = this;
  //we declare the user object which will be used in order to generate token
  const userObj = { _id: user._id.toHexString(), email: user.email };
  //here we use jwt to generate token based on user object and secret phrase defined by us and define the expiring time.
  //secret is defined as an environment variable
  const token = jwt.sign(userObj, process.env.DB_SECRET, { expiresIn: "1d" });
  //we return the generated token
  return token;
};

//method to verify if the token is valid
userSchema.statics.validateToken = function (token) {
  //we get the token from user and validate it using jwt and our secret phrase
  const verify = jwt.verify(token, process.env.DB_SECRET);
  //we return the result of verification
  return verify;
};
//define the user model here
const User = mongoose.model("User", userSchema);

//export the user model as a module
module.exports = { User };
