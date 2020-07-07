exports.createPostValidator = (req, res , next) => {
    // title verification
    req.check('title', "write a title").notEmpty()
    req.check('title', "title must be between 4 and 150").isLength({
        min : 4,
        max : 150
        });

    // body verification
    req.check('body', "write a title").notEmpty()
    req.check('body', "body must be between 4 and 4000").isLength({
    min : 4,
    max : 2000
    });

    const errors = req.validationErrors();

    if(errors) {
        // extract the first error and retrn it as a response
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({error: firstError});
    }

    // proceed to next middelware
    next();

    };

exports.userSignupValidator = (req, res, next) =>  {
    // name is not null and length 4-10 characters
    req.check("name","Name is required").notEmpty();
    // email is not null , valid and normalized
    req.check("email","Email must be between 3 and 32 chars")
        .matches(/.+\@.+\..+/) // regular pattern
        .withMessage("Email must contain @")
        .isLength({
            min : 4,
            max : 2000
        });

    // check for password
    req.check("password","Password is required").notEmpty();
    req.check("password")
        .isLength({min: 6})
        .withMessage("Password must contain at least 6 chars")
        .matches(/\d/) // at least 1 number
        .withMessage("Password must contain 1 number");



    //check for errors

    const errors = req.validationErrors();

    if(errors) {
        // extract the first error and retrn it as a response
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({error: firstError});
    }

    // proceed to next middelware
    next();

};

exports.passwordResetValidator = (req, res, next) => {
    // check for password
    req.check("newPassword", "Password is required").notEmpty();
    req.check("newPassword")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 chars long")
        .matches(/\d/)
        .withMessage("must contain a number")
        .withMessage("Password must contain a number");

    // check for errors
    const errors = req.validationErrors();
    // if error show the first one as they happen
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    // proceed to next middleware or ...
    next();
};


