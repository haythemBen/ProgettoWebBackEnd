const express = require('express');

const { signup, signin, signout,forgotPassword, resetPassword, socialLogin}  = require('../controllers/auth');
const  { userSignupValidator , passwordResetValidator} = require('../validator'); // automatically load index.js file
const { userById }  = require('../controllers/user');

const router = express.Router();
router.post('/signup',userSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);

// password forgot and reset routes
router.put("/forgot-password", forgotPassword);
router.put("/reset-password", passwordResetValidator, resetPassword);

// social login
router.post("/social-login", socialLogin)

// any route containing userId , our app will first execute userById()
router.param("userId", userById);

module.exports = router;