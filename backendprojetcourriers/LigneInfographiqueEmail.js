const nodemailer = require('nodemailer');
const fs = require('fs');
const generateInfographicImage = require('./generateInfographicImage');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_password'
  }
});

const sendEmailNotification = async (recipientEmail, factureID, newEtat, completedSteps) => {
  try {
    const imagePath = generateInfographicImage(completedSteps);

    const mailOptions = {
      from: 'your_email@gmail.com',
      to: recipientEmail,
      subject: 'Etat Update Notification',
      text: `Dear recipient,\nThe etat for facture ID ${factureID} has been updated. Please see the attached infographic line representing the etat update.\n\nBest regards,\nYour Name`,
      attachments: [{ path: imagePath }]
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }

      fs.unlinkSync(imagePath);
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

module.exports = sendEmailNotification;
