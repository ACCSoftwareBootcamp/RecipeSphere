//EP: MONGOOSE AND MONGODB SETUPS and User Model
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

//Design the signup schema that will be key/value in mongo db
const userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
});

// Customize the passportLocalMongoose options to use the 'email' field as the 'usernameField'
userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email', // Use 'email' as the username field
});

//Export the User model to main program
module.exports = mongoose.model('User', userSchema);
//END MONGODB SETUPS
