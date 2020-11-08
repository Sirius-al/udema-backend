const nodemailer = require('nodemailer');

const sendEmail = async options => {

    //? mail settings
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    //? mail options
    const mailOptions = {
        from: '(Admin) nafiz-al-din <nafaldin@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    }


    //? sending the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;