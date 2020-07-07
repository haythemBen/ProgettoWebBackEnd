const Post = require('../models/post');
const formidable = require('formidable'); //module for parsing form data, especially file uploads.
const fs = require('fs') ; // file system in core node js module
const _ = require('lodash'); // _ is a convention. lodash (used to update post data


// getPosts without pagination

exports.getPosts = (req, res) => {
	//res.send('hello from node  ppost');


	const posts = Post.find()    // or find().select("_id title body")
	// use populate because postedBy type is ObjectId which reffer to a different model , otherwise we use select
			.populate("postedBy", "_id name")
			.populate("comments", "text created")
			.populate("comments.postedBy", "_id name")
			.select("_id title body created likes")
			.sort({created :  -1})   // -1 to show the recent first in home page
		.then((posts)=> {
			//200 is the default number send by express framework : res.status(200).jso.. , or :
			res.json(posts);  // with {} it will be sent as an object , without as a table
			//res.json({posts:}); when the key = the name (posts)  : it works like this
		})
		.catch( err => console.log(err))

};

/*

// getPosts with pagination
exports.getPosts = async (req, res) => {
	// get current page from req.query or use default value of 1
	const currentPage = req.query.page || 1;
	// return 3 posts per page
	const perPage = 3;
	let totalItems;
 
	const posts = await Post.find()
		// countDocuments() gives the total count of posts
		.countDocuments()
		.then(count => {
			totalItems = count;
			return Post.find()
				.skip((currentPage - 1) * perPage)
				.populate("comments", "text created")
				.populate("comments.postedBy", "_id name")
				.populate("postedBy", "_id name")
				.sort({ date: -1 })
				.limit(perPage)
				.select("_id title body likes");
		})
		.then(posts => {
			res.status(200).json(posts);
		})
		.catch(err => console.log(err));
};
*/

exports.postById = (req, res, next, id) => {
	Post.findById(id)
	  .populate("postedBy", "_id name")
	  .populate("comments.postedBy", "_id name")
	  .populate("postedBy", "_id name role")
	  .select("_id title body created likes comments photo")
	  .exec((err, post) => {
		if (err || !post) {
		  return res.status(400).json({
			error: err
		  });
		}
		req.post = post;
		next();
	  });
  };
   
  exports.singlePost = (req, res) => {
	return res.json(req.post);
  };
// req.body will be sent from front end
// be sure to add another route to create post
//used body-parser to parse req.body because in express data were not parsed


exports.createPost = (req, res, next) => {
	let form = new formidable.IncomingForm(); // we expect to get the form from front end
	form.keepExtensions = true ; // jpeg,png ...
	form.parse(req , (err, fields, files) => {
		if(err){
			return res.status(400).json({
				err : "Image could not be uploaded"
			});
		}

		let post = new Post(fields)  ;     // new post from all fiels coming from request in front end
		// hide the pwd and the salt
		req.profile.hashed_password = undefined; //userById was executed the first > req.profile contain the user
		req.profile.salt = undefined;
		post.postedBy = req.profile ; // req profile have the user(id , email ...)
		if(files.photo){
			post.photo.data = fs.readFileSync(files.photo.path) ; // read img from the path
			post.photo.contentType = files.photo.type ;
		}
		post.save((err, result)=>{
			if(err) {
				return res.status(400).json({
					err: "Error while saving the post"
				});
			}
			res.json(result) ;

		});

	});


};

exports.postsByUser = (req, res) => {
	Post.find({postedBy : req.profile._id})
	// use populate because postedBy type is ObjectId which reffer to a different model , otherwise we use select
	.populate("postedBy","_id name")
	.select("_id title body created likes")
	.sort({created :  -1})
	.exec((err, posts)=>{
		if(err) {
			return res.status(400).json({
				error : err
			});
		}
		res.json(posts) ;
	})

};


exports.postById = (req, res, next, id) => {  // id come as route parameter
	Post.findById(id)
		.populate("postedBy", "_id name")
		.exec((err, post)=> {
			if(err || !post) {
				return res.status(400).json({
					error : err
				});
			}
			req.post = post ;
			next();
		});
};


exports.isPoster = (req, res, next) => {

	// error to avoid : not === , its ==
	let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id ; // auth property is created in jwt

	console.log("req.post", req.post);
	console.log("req auth", req.auth);
	console.log("post by id",req.post.postedBy._id);
	console.log("auth id", req.auth._id);
	console.log("is him ? ", req.post.postedBy._id == req.auth._id );

	if(!isPoster){
		return res.status(400).json({
			error : "User non authorised to make this action"
		});
	}
	next();
};

/*
exports.updatePost = (req, res,next) => {
	let post = req.post;
	post = _.extend(post, req.body);  // extend - mutate the source object : apply changes in req.body in the source object:user
	post.updated = Date.now();
	post.save(err => {
		if(err){
			return res.status(400).json({
				error : err
			});
		}
		res.json(post);
	});
};
*/


exports.updatePost = (req, res,next) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true ;
	form.parse(req,(err, fields, files) =>{            // the second parameter is how to handle incoming data : use callback function
		if (err) {return res.status(400).json({
			error : "node - updateUser -> error while uploading"
		})
		}
		// save the updates
		let post = req.post  ;       // see method userById
		post = _.extend(post, fields) ; // update changed fields(name, email..)
		post.updated = Date.now() ;

		// handle the image
		if (files.photo){
			post.photo.data = fs.readFileSync(files.photo.path) ;
			post.photo.contentType = files.photo.type ;
		}
		post.save((err, result) => {
			if (err){
				return res.status(400).json({
					error : "node - updateUser -> error while saving :",err
				})
			}

			res.json(post);

		})
	})
};



exports.singlePost = (req, res) => {
	return res.json(req.post);
};


exports.deletePost = (req, res, next) => {
	let post = req.post  ;  //(post is appended to the request in postById middelware)
	post.remove((err, post)=> {
		if(err || !post) {
			return res.status(400).json({
				error : err
			});
		}
		res.json({
			message : "Post removed successfully"
		});
	});
};

exports.photo = (req, res, next) => {
	res.set('Content-Type', req.post.photo.contentType);
	return res.send(req.post.photo.data);
};



exports.like = (req, res) => {
	Post.findByIdAndUpdate(req.body.postId, { $push: { likes: req.body.userId } }, { new: true }).exec(
		(err, result) => {
			if (err) {
				return res.status(400).json({
					error: err
				});
			} else {
				res.json(result);
			}
		}
	);
};

exports.unlike = (req, res) => {
	Post.findByIdAndUpdate(req.body.postId, { $pull: { likes: req.body.userId } }, { new: true }).exec(
		(err, result) => {
			if (err) {
				return res.status(400).json({
					error: err
				});
			} else {
				res.json(result);
			}
		}
	);
};


/*

exports.like = (req, res) => {
	// push is mongoose method
	Post.findByIdAndUpdate(req.body.postId , { $push : { likes: req.body.userId }}, {new : true}).exec(
		(err, result)=> {
		if(error){                      it is the error 6 hours blocked here :/ write if(err) not error
			return res.status(400).json({error : err});
		}
		else {
			res.json(result) ;
		}
	}
	);
};
*/

exports.comment = (req, res) => {
	let comment = req.body.comment ;
	comment.postedBy = req.body.userId ;

	Post.findByIdAndUpdate(req.body.postId, { $push: { comments: comment } }, { new: true })
		.populate("comments.postedBy", "_id name")
		.populate("postedBy", "_id name")
		.exec(
		(err, result) => {
			if (err) {
				return res.status(400).json({
					error: err
				});
			} else {
				res.json(result);
			}
		}
	);
};


exports.uncomment = (req, res) => {
	let comment = req.body.comment ;

	Post.findByIdAndUpdate(
		req.body.postId,
		{ $pull: { comments: {_id : comment._id} } }, { new: true })
		.populate("comments.postedBy", "_id name")
		.populate("postedBy", "_id name")
		.exec(
			(err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				} else {
					res.json(result);
				}
			}
		);
};


