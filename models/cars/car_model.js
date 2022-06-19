//to use mongoose to handle mongoDB queries
const mongoose = require("mongoose");
//to add pagination support
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
//to declare environment variables
require("dotenv").config();

//to declare car schema for mongoDB using mongoose
const carSchema = mongoose.Schema({
  //to define the model field of car record
  model: {
    //model is a string
    type: String,
    //model length is 200 characters
    maxLength: 200,
    //model is required
    required: [true, "Model is required!"],
  },
  //to define the make field of car record
  make: {
    //make is of type number
    type: Number,
    //make year can't be less then 1885 as first car was created in this year
    min: [1885, "First car was made in 1886"],
    //make year can't be more then 3000 as i think this app will become obsolete by then
    max: [3000, "Year can't be more than 3000"],
    //make year of car is required
    required: [true, "Make year is required!"],
  },
  //category of car
  category: {
    //category is of type string
    type: String,
    //category is must
    required: [true, "Category is mandatory!"],
    //to make sure the category is one of the values defined and nothing more
    enum: {
      values: ["Bus", "Sedan", "SUV", "Hatchback"],
      message: "Category not supported",
    },
  },
  //for color of car
  color: {
    //color of car is string
    type: String,
    //color of car is required
    required: [true, "Color is required"],
    //color length is 50 characters
    maxLength: 50,
  },
  //for registration number of car
  registrationNumber: {
    //registration number is of type string
    type: String,
    //registration number is required
    required: [true, "Registration Number is mandatory"],
    //registration number can't be more then 50 characters
    maxLength: 50,
    //registration number is unique for every car
    unique: true,
  },
});

//to check if registration number is already present in our database
carSchema.statics.registrationNumberTaken = async function (
  registrationNumber
) {
  //we find record based on registrationNUmber
  const number = await this.findOne({ registrationNumber });
  return !!number;
};

//we integrate the aggregatePaginate plugin to add paginate feature for car records
carSchema.plugin(aggregatePaginate);

//we define the car model here
const Car = mongoose.model("Car", carSchema);

//export the car model as a module
module.exports = { Car };
