//this is a test

const express = require('express');
const axios = require('axios');
const app = express();
const port = 3003; // Use your preferred port


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public')); // Serve static files from the 'public' folder
app.use(express.urlencoded({ extended: true })); // Parse form data in POST requests


// Array to store fetched recipes
let recipesArray = [];

// Routes
app.get('/', (req, res) => {
    //res.render('home');
    res.send("Welcome to the landing Page here!");
});

app.get('/home', (req, res) => {
    //res.render('home');
    res.send('Welcome to the Home Page!');
});

app.get('/about', (req, res) => {
    //res.render('about');
    res.send('Welcome to the about Page!');
});

app.get('/contact', (req, res) => {
    //res.render('contact');
    res.send('Welcome to the contact Page!');
});

// External API call for recipes with query parameters
//The /recipes route can be considered a basic example of a search route

//api key use config file:
//api endpoint with param

app.get('/recipes', (req, res) => {
    const queryParam = req.query.q; // Replace 'q' with your actual query parameter name

    // Construct the URL with query parameters
    const apiUrl = `https://api.example.com/recipes?q=${queryParam}`;

    axios.get(apiUrl)
        .then(response => {
            recipesArray = response.data; // Store fetched recipes in the array
            res.render('recipes', { recipes: recipesArray });
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
            res.status(500).send('Error fetching recipes, API not working');
        });
});

// Start listen the server
app.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
});
