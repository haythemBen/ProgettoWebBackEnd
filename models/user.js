const mongoose = require('mongoose');
const uuidv1 = require('uuid/v1');
const crypto = require('crypto'); // node js module to encrypt password
const {ObjectId} = mongoose.Schema ;

// define the schema of a post
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim : true,    //  remove white spaces from the string
        required : true

    },
    email:{
        type:String,
        trim : true,
        required : true

    },
    hashed_password:{    // take the input of the user and encrypt it by the virtual field then save the hashed version
        type:String,
        trim : true,
        required : true

    },
    salt : String,   // long generated stream
    created : {
        type: Date,
        default : Date.now
    },
    updated : Date,
    photo: {
        data : Buffer,      // data in binary format
        contentType : String
    },
    about : {
        type : String,
        trim : true
    },
    following: [{
        type : ObjectId,   // when follow a user , it will be referenced by the Id referencing to User model
        ref : "User"
    }],
    followers: [{
        type : ObjectId,   // when follow a user , it will be referenced by the Id referencing to User model
        ref : "User"
    }],

    resetPasswordLink: {
        data: String,
        default: ""
    }


});


// virtual field :
//, virtual properties aren’t static model properties,
// They are additional model functions returning values based on the default schema fields.
//setter methods are useful to split strings or do other operations
//get method is a function returning a the virtual value. You can do complex processing or just concatenate single document field values.

userSchema
    .virtual('password')
    .set(function (password) {
        // create temporary variable called _password
        //this is refered to userSchema
        this._password = password ;
        // generate timestamp (key)  using uuid package (line 2)
        this.salt = uuidv1();
        // encrypt the password using the generated timestamp
        this.hashed_password = this.encryptPassword(password); //per fare il hash alla password
        //this.hashed_password = password


    })
    .get(function () {
        return this._password ;

    });

// methods :
userSchema.methods = {
    authenticate: function(plainText){
       return this.encryptPassword(plainText) === this.hashed_password ;
       //return this.plainText === this.hashed_password;
    },

    encryptPassword : function (password) {
        // if (!password) return "";
        // try {
        //    return crypto.createHmac('sha1', this.salt)
        //        .update(password)
        //        .digest('hex'); // hexadecimal
        // } catch (err){
        //     return "";
        // }
        return password

    }
};



// export the model : to use it when create new user in the controller
module.exports = mongoose.model("User", userSchema) ;