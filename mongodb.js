// mongoose is needed to interact with the MongoDB database
const mongoose = require('mongoose');

require('dotenv').config()

const debug=require('debug')('mongodb')

// // port
// const {SERVER_PORT} = process.env


//Spread out the .env
const {MONGODB_USER,
    MONGODB_PASSWORD,
    MONGODB,
    MONGODB_HOST,
    MONGODB_PORT,
    SERVER_PORT} = process.env

    // connection object
const connectObject = {
  
    // properties required by new versions of mongodb
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // in .env files
    user: MONGODB_USER,
    pass: MONGODB_PASSWORD,
    authSource: "admin"
}


//2. SETUP THE MONGO DB USER
const url = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB}`


//3. CONNECT TO MONGO DB
// connect to MongoDB using JS Promise based structure
mongoose.connect(url, connectObject)
.then(function(){
    console.log(`Connected to Mongo database ${MONGODB} successfully`)
})
.catch(function(err){
    console.error(`Mongo connection failed with ${err}`)
})