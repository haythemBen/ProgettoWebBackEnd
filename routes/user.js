const express = require('express');

const { userById , allUsers, getUser, updateUser, deleteUser, userPhoto, addFollowing, addFollower, removeFollowing, removeFollower,findPeople}  = require('../controllers/user');
const { requireSignin }  = require('../controllers/auth'); //si applica come un mideelware nel router per verificare l'accesso

const router = express.Router();

router.put('/user/follow',requireSignin, addFollowing, addFollower);
router.put('/user/unfollow',requireSignin, removeFollowing, removeFollower);

router.get('/users', allUsers);
router.get('/user/:userId',requireSignin, getUser); // qualsiasi cosa catturata dopo / is: userId
router.put('/user/:userId',requireSignin, updateUser); // put: utilizzato per l'aggiornamento
router.delete('/user/:userId',requireSignin, deleteUser);


// caricamento foto: creo un percorso separato per il caricamento
router.get("/user/photo/:userId", userPhoto);


// chi seguire
router.get('/user/findpeople/:userId',requireSignin, findPeople);

// qualsiasi richiesta in arrivo: (route contenente userId) (esempio per accedere a un profilo persona),
// userById verrà eseguito per primo
router.param("userId", userById);

module.exports = router;
