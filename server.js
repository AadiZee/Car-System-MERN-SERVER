//to declare environment variables
require("dotenv").config();

//to use express
const express = require("express");

//to use mongoose to handle mongoDB queries
const mongoose = require("mongoose");

//to get params from body rather than url
const bodyParser = require("body-parser");

//to declare an instance of express
const app = express();

//importing users apis
const users = require("./routes/api/users/user");

//importing cars apis
const cars = require("./routes/api/cars/cars");

//to check user login
const { checkToken } = require("./middlewares/auth/auth");

//mongoURI for connecting with mongoDB Atlas cluster. I used environment variables to keep info private
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}?retryWrites=true&w=majority`;

//connecting to mongoDB atlas using mongoose
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//to use the bodyparser with express in order to get params from body
app.use(bodyParser.json());
//to check user token
app.use(checkToken);
//to setDefault url before apis declared in users and to initialize them
app.use("/api/users", users);
//to setDefault url before apis declared in cars and to initialize them
app.use("/api/cars", cars);

//defining static path of build
app.use(express.static("client/build"));

//to check environment variables to determine if app is in production or not
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`App listening on port ${port} !`));
