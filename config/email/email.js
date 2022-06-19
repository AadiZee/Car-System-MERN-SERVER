//mailer service for node js
const nodemailer = require("nodemailer");
//to generate email templates
const Mailgen = require("mailgen");
//to get environment variables
require("dotenv").config();

//this is used to create a transporter that will send the email
//we define what service is being used
// we also provide an email and it's password
//email password are defined in environment variables
let transporter = nodemailer.createTransport({
  service: "Gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

//this is where we define the welcome email
const registerEmail = async (userEmail, emailToken) => {
  //we put serious functions in try in order to catch unexpected errors that might crash our app
  try {
    //we tell the Mailgen which theme to use
    let mailGenerator = new Mailgen({
      //Mailgen theme
      theme: "default",
      //our website details
      product: {
        //website name
        name: "Car System",
        //website url
        link: `${process.env.EMAIL_MAIN_URL}`,
      },
    });

    //the email content for the email that will be sent
    const email = {
      //.body of the email
      body: {
        //main header
        intro: "Welcome to car system! We're excited to have you on board!",
        //sub heading. we also give the user password at the end
        //emailToken = generatedPassword
        action: {
          instructions: `To login use the following password: ${emailToken}`,
        },
        //footer
        outro: "Need help, or have any questions? Just reply to this email.",
      },
    };

    //this generates the full email HTML
    let emailBody = mailGenerator.generate(email);

    //we define the details of email
    let message = {
      //our email
      from: process.env.EMAIL,
      //user email
      to: userEmail,
      //subject of email
      subject: "Welcome to car system",
      //html for email body
      html: emailBody,
    };
    //here mail is sent to the user
    await transporter.sendMail(message);
    return true;
  } catch (error) {
    //we catch any errors/exceptions thrown here and return response with error caught
    throw error;
  }
};
//to export the function as module
module.exports = {
  registerEmail,
};
