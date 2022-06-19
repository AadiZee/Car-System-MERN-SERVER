//to use express
const express = require("express");
//to get registerEmail method defined in for node_mailer in order to send welcome email
const { registerEmail } = require("../../../config/email/email");
//to check if user is logged in using middleware functions
const { checkLoggedIn } = require("../../../middlewares/auth/auth");
//to get user model/schema and any methods/statics declared with them
const { User } = require("../../../models/users/user_model");
//this is a package to generate the password on registration
const otpGenerator = require("otp-generator");
//to get environment variables
require("dotenv").config;

//to use the express router instance in order to generate the apis after the default user api's in  server.js file
let router = express.Router();

//api to register user
router.route("/register").post(async (req, res) => {
  //we put serious functions in try in order to catch unexpected errors that might crash our app
  try {
    //to check if user email is already present in the database
    if (await User.emailTaken(req.body.email)) {
      //return error response if user is present
      return res.status(400).json({ message: "Sorry! email already exists" });
    }
    //we generate a random password at the time of registration
    let password = otpGenerator.generate(8, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: true,
      specialChars: false,
    });

    //we create a new user instance which will be used to add user to database using the email the user provided and with the random password we generated
    ///password hashing is defined as a method in the user_model file
    const user = new User({
      email: req.body.email,
      password: password,
    });

    //we save the user
    const doc = await user.save();

    //this is the method that is used in order to send email to user with their random generated password using nodemailer and gmail
    let re = await registerEmail(doc.email, password);

    //returning successful response after adding user to database and sending the mail
    return res
      .status(200)
      .json({ message: "Registered Successfully! Check email for password!" });
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    return res
      .status(400)
      .json({ message: "There was a problem registering!", error: error });
  }
});

//api to let user login
router.route("/login").post(async (req, res) => {
  //we put serious functions in try in order to catch unexpected errors that might crash our app
  try {
    //we find the user from database based on the email provided by the user
    let user = await User.findOne({ email: req.body.email });
    //we check if there is no user we return an error response with proper message
    if (!user) return res.status(400).json({ message: "User not found" });
    //there is a method declared in user_model file by comparePassword name which is used to compare hashed password in database and entered password by user
    const compare = await user.comparePassword(req.body.password);
    //we return an error response if the password entered does not match the hashed password present in our database
    if (!compare) {
      return res.status(400).json({ message: "Password Incorrect" });
    }

    //if passwords match we generate token for user. This method is also defined in user_model
    const token = user.generateToken();

    //after token generation we send the token as a cookie response so that the token is saved in the cookies of user
    //we defined getUserProps at the end of the page that will return the _id and email of user in response. This can be useful if our app is using redux or email+token auths
    res.cookie("access-token", token).status(200).send(getUserProps(user));
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    res.status(400).json({
      message: "Error, There was a problem logging in!",
      error: error,
    });
  }
});

//api to update user email
router.route("/update_email").patch(checkLoggedIn, async (req, res) => {
  //we put serious functions in try in order to catch unexpected errors that might crash our app
  try {
    //we check if the newemail that is passed in the body already present in our database
    if (await User.emailTaken(req.body.newemail)) {
      //we return proper error response based on the response
      return res.status(400).json({ message: "New Email already exists!" });
    }
    //if we don't find the newemail in our database, we find the user based on original email and set that email to newemail in our database
    //the new object is used in order to return new updated record from mongodb
    const user = await User.findOneAndUpdate(
      //the first argument is used to find user based on email
      {
        email: req.body.email,
      },
      //set is used to define what field are we updating  in the database
      { $set: { email: req.body.newemail } },
      //this is used to return updated record after adding to database
      { new: true }
    );

    //if we are unable to find user based on original email we return error response
    if (!user) return res.status(400).json({ message: "User not found" });

    //if user is found and email is updated we generate a newToken based on the new info
    //we also set this token as a cookie on the users browser
    const token = user.generateToken();
    res
      .cookie("access-token", token)
      .status(200)
      .json({ message: "Email updated" });
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    res.status(400).json({ message: "User not found" });
  }
});

//to check if user token is valid
//we check it using the checkLoggedIn middleware
//if middle ware returns true we send the user
//else we send error response
router.route("/isauth").get(checkLoggedIn, async (req, res) => {
  //we put serious functions in try in order to catch unexpected errors that might crash our app
  try {
    //if middle ware returns true we send the user
    res.status(200).send(getUserProps(req.user));
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    res.status(400).send({ message: "You are not signed in!", error: error });
  }
});

//api to let user update there password
router.route("/update_password").patch(checkLoggedIn, async (req, res) => {
  //we put serious functions in try in order to catch unexpected errors that might crash our app
  try {
    //we find user based on email
    const user = await User.findOneAndUpdate(
      //finding user based on email
      { email: req.body.email },
      //replacing old password with new password (it will be hashed before saving as hashing is defined as a pre method in user_model)
      { $set: { password: req.body.newpassword } },
      //to return the updated record after adding to mongodb
      { new: true }
    );
    //if no user is found based on email we return error response with message
    if (!user) return res.status(404).json({ message: "User not found!" });
    //if user is found and updated we generate a new token
    const token = user.generateToken;

    //after token generation we return it as a cookie item to save it as a cookie in users browser
    res
      .cookie("access-token, token")
      .status(200)
      .json({ message: "Password updated" });
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    res.status(400).json({ message: "Unable to change password" });
  }
});

//to delete a user from our database
router.route("/delete").delete(checkLoggedIn, async (req, res) => {
  //we put serious functions in try in order to catch unexpected errors that might crash our app
  try {
    //getting email from body
    const email = req.body.email;
    //we find the user based on email in the body
    if (await User.findOneAndDelete(email)) {
      //if user is deleted we send user deleted successfully response
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      //if we don't find user based on email we return 400 response
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    res.status(400).json({ message: "Unable to delete user" });
  }
});

//to send user details. best used if we have redux in frontend
const getUserProps = (props) => {
  return {
    _id: props._id,
    email: props.email,
  };
};

//to export the api's otherwise an exception is thrown at the time of starting backend
module.exports = router;
