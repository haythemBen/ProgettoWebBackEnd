exports.createPostValidator = (req, res , next) => {
    // title verification
    req.check('title', "scrivi un titolo").notEmpty()
    req.check('title', "il titolo deve essere compreso tra 4 e 150 caratteri").isLength({
        min : 4,
        max : 150
        });

    // body verification
    req.check('body', "scrivi un body").notEmpty()
    req.check('body', "il body deve essere compreso tra 4 e 2000 caratteri").isLength({
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
    req.check("name","Nome richiesto").notEmpty();
    // email is not null , valid and normalized
    req.check("email","L'email deve essere compresa tra 3 e 32 caratteri")
        .matches(/.+\@.+\..+/) // regular pattern
        .withMessage("L'email deve contenere @")
        .isLength({
            min : 4,
            max : 2000
        });

    // check for password
    req.check("password","E 'richiesta la password").notEmpty();
    req.check("password")
        .isLength({min: 6})
        .withMessage("La password deve contenere almeno 6 caratteri")
        .matches(/\d/) // at least 1 number
        .withMessage("La password deve contenere 1 numero");



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
    req.check("newPassword", "E 'richiesta la password").notEmpty();
    req.check("newPassword")
        .isLength({ min: 6 })
        .withMessage("La password deve contenere almeno 6 caratteri")
        .matches(/\d/)
        .withMessage("deve contenere 1 numero")
        .withMessage("La password deve contenere 1 numero");

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


