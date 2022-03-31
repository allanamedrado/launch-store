const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "b090d515ac73be",
      pass: "1ab3639794d826"
    }
  });

