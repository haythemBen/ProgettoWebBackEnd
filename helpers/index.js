const nodeMailer = require("nodemailer");

const defaultEmailData = { from: "noreply@node-react.com" };

// send email
exports.sendEmail = emailData => {
    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: "use_yours@gmail.com",
            pass: "pgxylxhffjkjjyyj"
        }
    });
    return (
        transporter
            .sendMail(emailData)
            .then(info => console.log(`Message sent: ${info.response}`))
            .catch(err => console.log(`Problem sending email: ${err}`))
    );
};


