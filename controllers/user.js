const User = require('../models/user');
const _ = require('lodash'); // _ is a convention. lodash (used to update user data
const formidable = require('formidable'); //module for parsing form data, especially file uploads.
const fs = require('fs') ; // file system in core node js module

exports.userById= (req, res, next, id) => {
    // this findByID is in mongoose model User
    // execute : will find err or user
    User.findById(id)
        //populate followers and following users array (i add it when i added followers and following to app)
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, user) => {
        if (err|| !user){
            return res.status(400).json({
                error : "User not found"
            });
        }
        req.profile = user ; // return user object to the request as the name of "profile"
        //console.log('UserByID');
        next();

    });
};

// verify if a user has authorisation to update his profile
exports.hasAuthorisation = (req, res, next) => {
    const authorised = req.profile && req.auth && req.profile._id === req.auth._id ;
    if(!authorised){
        res.status(403).json({
            error : "User is not authorised to perform this action"
        });
    }
};

exports.allUsers = (req, res) => {
    User.find((err, users) => {
        if (err){
            return res.status(400).json({
                error : err
            });
        }
        //res.json({ users}) ;   // = res.json({ users : users}) ; return object with key "users"
        // however nel frontend i need an array to use map so it will :
        res.json( users) ;
    }).select("name email created");
};


// if an user enter to other profile
exports.getUser = (req, res) => {
    console.log('getUser');
    // avoid display hashed password and salt to users
    req.profile.hashed_password = undefined; //userById was executed the first > req.profile contain the user
    req.profile.salt = undefined;
    return res.json(req.profile) ;
};

// without profile picture , using json format
/*
exports.updateUser = (req, res,next) => {
    let user = req.profile;
    user = _.extend(user, req.body);  // extend - mutate the source object : apply changes in req.body in the source object:user
    user.updated = Date.now();
    user.save((err) => {
        if(err){
            return res.status(400).json({
                error : "You are not authorised to perform this action"
            })
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json({user});
    });
};
 */


exports.updateUser = (req, res,next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true ;
    form.parse(req,(err, fields, files) =>{            // the second parameter is how to handle incoming data : use callback function
        if (err) {return res.status(400).json({
            error : "node - updateUser -> error while uploading"
            })
        }
        // save the updates
        let user = req.profile  ;       // see method userById
        user = _.extend(user, fields) ; // update changed fields(name, email..)
        user.updated = Date.now() ;

        // handle the image
        if (files.photo){
            user.photo.data = fs.readFileSync(files.photo.path) ;
            user.photo.contentType = files.photo.type ;
        }
        user.save((err, result) => {
            if (err){
                return res.status(400).json({
                    error : "node - updateUser -> error while saving :",err
                })
            }

            user.hashed_password = undefined ;
            user.salt = undefined ;
            res.json(user);

        })
    })
};

// get the user's photo
exports.userPhoto = (req, res, next) => {
    if (req.profile.photo.data){        // see method userById
        res.set("Content-Type" , req.profile.photo.contentType);
        return res.send(req.profile.photo.data);
    }
    next();
};


exports.deleteUser = (req, res,next) => {
    let user = req.profile;
    user.remove((err, user) => {
        if(err){
            return res.status(400).json({
                error : err
            });
        }
        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;
        return res.json({message : "user deleted"}) ;

    })

};

// follow & unfollow

exports.addFollowing =(req, res, next) =>{
    // push:update  // followId come frm frontend
    User.findByIdAndUpdate(req.body.userId, {$push:{following: req.body.followId}}, (err, result)=>{
        if(err){
            return res.status(400).json({error : err});
        }
        next(); // to continue to add follower
    }) ;
};

exports.addFollower =(req, res) => {
    // push:update  // followId come frm frontend // {new: true} : mongodb will return all the data not only the updated data
    User.findByIdAndUpdate(req.body.followId, {$push:{followers: req.body.userId}},{new: true} )
        // return everything with new changes
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, result) => {
            if (err){
                return res.status(400).json({error : err});
            }

        result.hashed_password = undefined ;
        result.salt = undefined ;
        res.json(result) ;

    });
};

// remove follow & unfollow

exports.removeFollowing =(req, res, next) =>{
    // push:update  // unfollowId come frm frontend
    User.findByIdAndUpdate(req.body.userId, {$pull:{following: req.body.unfollowId}}, (err, result)=>{
        if(err){
            return res.status(400).json({error : err});
        }
        next(); // to continue to add follower
    }) ;
};

exports.removeFollower =(req, res) => {
    // push:update  // unfollowId come frm frontend // {new: true} : mongodb will return all the data not only the updated data
    User.findByIdAndUpdate(req.body.unfollowId, {$pull:{followers: req.body.userId}},{new: true} )
    // return everything with new changes
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, result) => {
            if (err){
                return res.status(400).json({error : err});
            }

            result.hashed_password = undefined ;
            result.salt = undefined ;
            res.json(result) ;

        });
};


exports.findPeople = (req,res) => {
    let following = req.profile.following ;
    // avoid to suggest user to himself
    following.push(req.profile._id);
    User.find({_id : {$nin : following}}, (err, users) => {
        if (err){
            return res.status(400).json({error : err});
        }
        res.json(users)
    }).select("name");

};
