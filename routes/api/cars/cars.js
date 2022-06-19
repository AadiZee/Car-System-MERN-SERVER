//to use express
const express = require("express");
//to check if user is logged in using middleware functions
const { checkLoggedIn } = require("../../../middlewares/auth/auth");
//to get car model/schema and any methods/statics declared with them
const { Car } = require("../../../models/cars/car_model");
//this is for sorting. (Currently not used)
const { sortArgsHelper } = require("../../../helpers/helpers");
//to get environment variables
require("dotenv").config();
//to use the express router instance in order to generate the apis after the default user api's in  server.js file
let router = express.Router();
//api to add a new car record
router.route("/admin/add_car").post(checkLoggedIn, async (req, res) => {
  //we put serious functions in try in order to catch unexpected errors that might crash our app
  try {
    //to check if registrationNumber is already present in the database. as registrationNumber is unique for cars
    const check = await Car.registrationNumberTaken(
      req.body.registrationNumber
    );
    //if we find car based on registration number error response is sent
    if (check) {
      res.status(400).json({ message: "Registration number already exists" });
    } else {
      //if we don't find registrationNumber we proceed to add car
      //we create a new car instance which will be used to add car record to database the values in body that the user provided
      const car = new Car({
        ...req.body,
      });

      //we save the car record
      const result = await car.save();
      //after successful adding of record we return ok response with the new record
      res.status(200).json(result);
    }
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    res.status(400).json({ message: "Error adding Car", error: error });
  }
});

//get car record based on id
router
  .route("/admin/:id")
  .get(checkLoggedIn, async (req, res) => {
    try {
      const _id = req.params.id;
      const car = await Car.findById(_id);
      if (!car || car.length === 0) {
        return res.status(400).json({ message: "Car Not Found" });
      }
      res.status(200).json(car);
    } catch (error) {
      res.status(400).json({ message: "Error fetching car", error: error });
    }
  }) //to update car record based on id
  .patch(checkLoggedIn, async (req, res) => {
    try {
      //we get the id from url params
      const _id = req.params.id;
      //we find the car record in the database based on id and replace the record
      const car = await Car.findOneAndUpdate(
        { _id },
        { $set: req.body },
        { new: true }
      );
      //if no car is found based on database id then we send error response with message
      if (!car) {
        return res.status(400).json({ message: "Car not found" });
      }
      //if updating is successful we return ok response with new record
      res.status(200).json(car);
    } catch (error) {
      //we catch any errors/exceptions thrown here and return response with error caught
      res
        .status(400)
        .json({ message: "Error Updating Car Record", error: error });
    }
  }) //in order to delete car record based on record id
  .delete(checkLoggedIn, async (req, res) => {
    //we put serious functions in try in order to catch unexpected errors that might crash our app
    try {
      //we get car record id from params
      const _id = req.params.id;
      //we find the car record based on id from database
      const car = await Car.findByIdAndRemove(_id);
      //if we don't get record we response with proper error response and message
      if (!car) {
        return res.status(400).json({ message: "Car Not Found" });
      }
      //if car record deletion is successful we send OK response with message
      res.status(200).json({ message: "Car Record Deleted" });
    } catch (error) {
      //we catch any errors/exceptions thrown here and return response with error caught
      res
        .status(400)
        .json({ message: "Error deleting car record!", error: error });
    }
  });

//this api is used to handle pagination of records from backend
router.route("/admin/paginate").post(checkLoggedIn, async (req, res) => {
  try {
    //this is the query that will be used to aggregate records
    let aggQuery;
    aggQuery = Car.aggregate();

    //we get record limit from body. This defines how many records will be fetched. By default 5
    const limit = req.body.limit ? req.body.limit : 5;
    //these options define the page number, record limit per page and how to sort the records
    const options = {
      page: req.body.page,
      limit: limit,
      sort: { _id: "desc" },
    };
    //we have used aggregatePaginate in car_model and pass the query and options to this api to get records accordingly from database
    const car = await Car.aggregatePaginate(aggQuery, options);
    //we return proper response with all records returned by database
    res.status(200).json(car);
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    res
      .status(400)
      .json({ message: "Error fetching paginated records!", error: error });
  }
});

//this api is used to get all car records
router.route("/admin/").get(checkLoggedIn, async (req, res) => {
  try {
    //to check if user email is already present in the database
    const car = await Car.find({});
    //if no record found we give database with proper response code
    if (!car) {
      res.status(400).json({ message: "Error getting car records!" });
    }
    //we return all car records
    res.status(200).json({ message: "Records Found!", data: [...car] });
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    res.status(400).json({ message: "Error fetching records!", error: error });
  }
});

//to export the api's otherwise an exception is thrown at the time of starting backend
module.exports = router;
