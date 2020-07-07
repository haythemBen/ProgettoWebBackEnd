const express = require('express');

const {getPosts, createPost,postsByUser, postById, isPoster,updatePost ,deletePost, photo, singlePost , like, unlike, comment, uncomment}  = require('../controllers/post');
const { requireSignin }  = require('../controllers/auth'); // apply as a mideelware in the router to verify sign in
const {createPostValidator} = require('../validator'); // automatically load index.js file
const { userById }  = require('../controllers/user');

const router = express.Router();

router.get('/posts',getPosts);
// why post : post from the front end to the back end
// /post : the request from postman : localhost:8080/post
// it was :
//router.post('/post', postController.createPost);

// like unlike
router.put("/post/like", requireSignin, like);
router.put("/post/unlike", requireSignin, unlike);

// comment uncomment
router.put("/post/comment", requireSignin, comment);
router.put("/post/uncomment", requireSignin, uncomment);

// but wa arre adding the validator : make create post after the validator check
//router.post('/post/new/:userId', requireSignin,createPostValidator , createPost);
// i make createPost before createPostValidator to avoid the error : formidable should run fast before we run the validation
router.post("/post/new/:userId", requireSignin, createPost, createPostValidator );
router.put("/post/:postId",requireSignin,isPoster, updatePost) ;

//the id of authenticate user should === id user of the post
router.delete("/post/:postId",requireSignin,isPoster, deletePost ) ;
router.get("/post/:postId", singlePost);
router.get("/posts/by/:userId", postsByUser);

// photo
router.get("/post/photo/:postId", photo);









// any route (any request) containing userId , our app will first execute userById()
router.param("userId", userById);
router.param("postId", postById);

module.exports = router;
