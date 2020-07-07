const express = require('express');
const app = express ();

/*
const myOwnMiddelware = (req, res, next) => {
	console.log("middelware applied");
	next();

};*/
// middelware
const morgan = require("morgan");
const bodyParser = require("body-parser"); // help parse request body
var cookieParser = require('cookie-parser'); // help parse request cookies
const expressValidator = require('express-validator'); // personalize error msg
const fs = require('fs'); // to read files
const cors =  require('cors'); // apply cross origin ressource sharing : implemented to make request from front 3000 end to back end 8080
// use installed dotenv to load .env variables
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true}).then(() => console.log('DB connected'));
mongoose.connection.on("error", err => {
	console.log('DB not connected : ${err.message}'); 
});
//const postRoutes = require('./routes/post.js')
const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
// display documentation file
app.get('/' , (req, res) => {
	fs.readFile('docs/apiDocs.json', (err, data) => {
		if(err){
			res.status(400).json({
				error : err
			})
		}
		const docs = JSON.parse(data);
		res.json(docs);
	});
});

app.use(function(req, res, next) {

	res.header("Access-Control-Allow-Origin", "*");

	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	next();

});


app.use(morgan("dev"));
//app.use(myOwnMiddelware);
app.use(bodyParser.json());
app.use(cookieParser()); // user for the authentication with jwt
app.use(expressValidator());
app.use(cors());

app.use("/", postRoutes) ; // 'use' not 'get' because we are using a middelware
app.use("/", authRoutes) ;
app.use("/",userRoutes);
// handel error : whenever the user receive UnauthorizedError send this response
app.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		res.status(401).json({error : 'Unauthorised - invalid token'});
	}
});
//8080 is defult value
const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log('A node api is  listenig p  on port :${port}');

});