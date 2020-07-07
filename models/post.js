const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema ;
// define the schema of a post
const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required : true

    },
    body: {
        type:String,
        required : true
    },

    photo: {
        data : Buffer,      // data in binary format
        contentType : String
    },
    updated : Date,
    postedBy :{
        type : ObjectId,
        ref : "User"  //User : is user model
    },

    created :{
        type : Date,
        default : Date
    },

    likes: [{
        type: ObjectId,
        ref: 'User' }],

    comments :[{
        text : String,
        created : {type : Date, default: Date.now},
        postedBy : {type: ObjectId, ref : "User"}
    }]


});

// export the model : to use it when create new post in the controller
module.exports = mongoose.model("Post", postSchema) ;