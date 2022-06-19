//we get the user model
const { User } = require("../../models/users/user_model");
//we get jwt here in order to verify token
const jwt = require("jsonwebtoken");
//to declare environment variables
require("dotenv").config();

//to export the function as a module
exports.checkToken = async (req, res, next) => {
  //we put serious functions in try in order to catch unexpected errors that might crash our app
  try {
    //we get token value from the request headers
    if (req.headers["access-token"]) {
      //verify token
      const accessToken = req.headers["access-token"];
      //verifying and separating fields from jwt verification
      const { _id, email, exp } = jwt.verify(
        accessToken,
        process.env.DB_SECRET
      );
      //setting the response locals after finding user by id from database
      res.locals.userData = await User.findById(_id);
      //to continue with our request response
      next();
    } else {
      //even if token is not verified we proceed
      next();
    }
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    return res.status(401).json({ error: "Token not valid", errors: error });
  }
};

//to check if user is logged in
exports.checkLoggedIn = (req, res, next) => {
  //to check if response locals contain user data
  const user = res.locals.userData;
  //if no user exists we return response with error code and message
  if (!user) return res.status(401).json({ error: "User not logged in" });
  //if user exists we set request user to user
  req.user = user;
  //we proceed with our request response function
  next();
};
