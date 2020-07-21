const jwt = require('jsonwebtoken');
require('dotenv').config() ; // import some variables from .env file
const expressJwt = require('express-jwt'); //module lets you authenticate HTTP requests using JWT tokens in your Node.js applications
const User = require('../models/user');

// for reset password :
const _ = require("lodash");
const { sendEmail } = require("../helpers");
// load env
const dotenv = require("dotenv");
dotenv.config();

// asynch/wait : the code ask js to wait for one instruction to complete before moving to another
// was introduced in v8 as a solution for methods chaining in node js
exports.signup = async (req, res) => {
    const userExists = await User.findOne({email : req.body.email});
    if (userExists) return res.status(403).json({
        error : "email esistita"
    });
    const user = await new User(req.body);
    await user.save();
    res.status(200).json({
        message : "Iscriviti con successo per favore accedi"
    });
};


exports.signin = async (req, res) => {
    // find user based in email
    const {email,password} = req.body;

    User.findOne({email}, (err, user) => { // if success : we get the user else get error
        if (err || !user){
            return res.status(401).json({
                error : "No account with this Email, Per favore accedi"
            });
        }
        // create autenticate method in model and use here : verify if the input password when encrypt it with user salt is equal to hashed password 
        if(!user.authenticate(password)){
            return res.status(401).json({
                error : "Email e password non corrispondono"
            });
        }




    //generate a token with user id and secret (in the .env file)
    const token = jwt.sign({_id: user._id},process.env.JWT_SECRET);

    // persist the token as 't'(or other name) in cookie with expiry date
    res.cookie('t', token, {expire : new Date() +9999});
    //return response with user and token to frontend client
        // like that
        const {_id, name, email} = user ;
        return res.json({token, user:{_id, email, name}});
        //or
        //return res.json({token, user:{user._id, user.email, user.name}});

    })

};


exports.signout = async (req, res) => {
    res.clearCookie("t");
    return res.json({message : "disconnessione con successo"});
};

// require signin to see the posts for example. using the secret key in .env
exports.requireSignin = expressJwt({
    //if the token is valid, express jwt append the verified users id
    //in an auth key to the request object

    secret : process.env.JWT_SECRET,
    userProperty : "auth"
});


// add forgotPassword and resetPassword methods
exports.forgotPassword = (req, res) => {
    if (!req.body) return res.status(400).json({ error: "Nessuna richiesta body" });
    if (!req.body.email)
        return res.json({ error: "Nessuna e-mail nel corpo della richiesta" });

    console.log("forgot password finding user with that email");
    const { email } = req.body;
    console.log("signin req.body", email);
    // find the user based on email
    User.findOne({ email }, (err, user) => {
        if (err || !user)
            return res.status("401").json({
                error: "L'utente con quell'email non esiste!"
            });

        // generate a token with user id and secret
        const token = jwt.sign(
            { _id: user._id, iss: "NODEAPI" },
            process.env.JWT_SECRET
        );

        // email data
        const emailData = {
            from: "noreply@node-react.com",
            to: email,
            subject: "Social network - Password Reset Instructions",
            text: `Si prega di utilizzare il seguente link per reimpostare la password: ${
                process.env.CLIENT_URL
            }/reset-password/${token}`,
            html: `<p>Si prega di utilizzare il seguente link per reimpostare la password:</p> <p>${
                process.env.CLIENT_URL
            }/reset-password/${token}</p>`
        };

        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ error: err });
            } else {
                sendEmail(emailData);
                return res.status(200).json({
                    message: `L'email è stata inviata a ${email}. Segui le istruzioni per reimpostare la tua password .`
                });
            }
        });
    });
};

// to allow user to reset password
// first you will find the user in the database with user's resetPasswordLink
// user model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we got the right user

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    User.findOne({ resetPasswordLink }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status(401).json({
                error: "link non valido !"
            });

        const updatedFields = {
            password: newPassword,
            resetPasswordLink: ""
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Operazione di reimpostazione della password completata correttamente.`
            });
        });
    });
};


exports.socialLogin = (req, res) => {
    // try sign up by finding user with req.email
    let user = User.findOne({email: req.body.email},(err, user) => {


        if(err || !user){
            // create a new user and login
            user = new User(req.body);
            req.profile = user;
            user.save();
            // generate a token with user id and secret
            const token = jwt.sign(
                { _id: user._id, iss: "NODEAPI" },
                process.env.JWT_SECRET
            );
            res.cookie("t", token, { expire: new Date() + 9999 });
            // return response with user and token to frontend client
            const { _id, name, email } = user;
            return res.json({ token, user: { _id, name, email } });

        }

        else{
            // update existing user with new social info and login
            req.profile = user;
            user = _.extend(user, req.body);
            user.updated = Date.now();
            user.save();
            // generate a token with user id and secret
            const token = jwt.sign(
                { _id: user._id, iss: "NODEAPI" },
                process.env.JWT_SECRET
            );
            res.cookie("t", token, { expire: new Date() + 9999 });
            // return response with user and token to frontend client
            const { _id, name, email } = user;
            return res.json({ token, user: { _id, name, email } });

        }
    });


};