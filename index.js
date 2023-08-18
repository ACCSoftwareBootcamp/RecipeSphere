
//Import required external node module
//Import the Express framework for handling HTTP request
const express = require('express');

//Import Axios for making HTTP requests
const axios = require('axios');

//Create an instance fo the express module
const app = express();


//INSTALL NODEMAILER FOR OUR CONTACT PAGE
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

//CONFIGURE THE ZOHO MAILER ACCOUNT FOR OUR CONTACT PAGE
const mailTransporter = nodemailer.createTransport({
    service: 'Zoho',
    auth: {
        user: 'recipesphere@zohomail.com',
        pass: 'june2023cohort'
    }
});


//Specify the PORT number on the local host to run server 
const port = 3003; // Use your preferred port


// Set EJS as the view engine and middleware.
app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files from the 'public' folder
app.use(express.urlencoded({ extended: true })); // Parse form data in POST requests
// Parse incoming request data
app.use(bodyParser.urlencoded({ extended: true }));

// Define API credential and base URL

//EP: Adding our API ID and API key 
const appId = '71deea61'
const appKey = '9572a22f509a714cdc8879798fb0ff78'
const baseUrl = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${appId}&app_key=${appKey}`;


// Array to store fetched recipes
let recipesArray = [];


// Create Routes using express Get method which has parameter for path and callback function.


//Landing page
app.get('/landing', (req, res) => {
    res.render('landing');
});

  
//Root to landing page too
app.get('/', (req, res) => {
    res.render('landing');
});

//Sign Up page to render
app.get('/signup', (req, res) => {
    res.render('signup');
});


//Login page render
app.get('/login', (req, res) => {
    res.render('login');
});


//Login page render
app.post('/login', (req, res) => {
    res.render('login');
});



//Home page - send a simple response
app.get('/home', (req, res) => {
    res.render('home');
});

//About page to render 
app.get('/about', (req, res) => {
    res.render('about');
});

//Contact Page to render
app.get('/contact', (req, res) => {
    res.render('contact');

});

//EP: SUBMIT CONTACT FORM TO ZOHO MAIL SERVER
app.post('/contact', (req, res) => {
    const { firstName, lastName, email, concerns } = req.body;

  const mailOptions = {
    from: 'recipesphere@zohomail.com',
    to: 'recipesphere@zohomail.com', // Change this to the recipient's email
    subject: 'Contact Form Submission',
    text: `
      First Name: ${firstName}
      Last Name: ${lastName}
      Email: ${email}
      Concerns: ${concerns}
    `
  };


 // Send email using mailTransporter
 mailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      // Redirect back to the contact page with a success query parameter
      res.redirect('/contact?success=true');
     // Send a JSON response indicating success
    //  res.json({ success: true });

    }
  });
});//END APP.POST



// External API call for recipes with query parameters for user searching recipe.
app.get('/search', (req, res) => {
    //EP: The searchTerm will either default to 'desserts' if there's no
    //entry in the name=recipesearch input from the search.ejs page.
    const searchTerm = req.query.recipesearch || 'desserts';
    //Set the baseUrl and append the searchTerm query
    const apiUrl = `${baseUrl}&q=${searchTerm}`;
    //Axios call to Edam food api
    axios.get(apiUrl)
        .then(response => {
            // Store fetched recipes in the array
            const data = response.data;
            res.render('search.ejs', { data: data.hits, searchTerm },
            );//end res.render
        })//end .then-response
        .catch(error => {
            console.error('Error fetching recipes:', error);
            res.status(500).send('Error fetching recipes, API not working');
        });//end .catch-error
});


// For user wrong entry: Middleware for handling 404 errors - Inside the middleware function, status code to 404, 
//indicating that the resource was not found
app.use((req, res, next) => {
    res.status(404).send("<h1>404!!! Not found, please use a valid URL.</h1>");
});

// Start listen the server on the local PORT
app.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
});
