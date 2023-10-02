//Import dependencies used by the Program
const express = require("express");
const app = express();

//Passport and Express Session for local authentication
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
//Session secret for local authentication
app.use(
  session({
    secret: "recipesphere",
    resave: false,
    saveUninitialized: false,
  })
);


// MIDDLEWARES
// //   logger
// app.use(logger(process.env.NODE_ENV || "dev"))
//   body parsers for x-www-form-urlencoded and json
app.use(express.urlencoded({extended: true}))  // data format of key:value
                                               // e.g. description=Feed+a+gorilla&isComplete=false
                                               app.use(express.json({
    // represents the enhanced parser library
    extended: true
}))       



//Axios for making HTTP requests
const axios = require("axios");


//Mongoose for delete
const mongoose = require("mongoose");

//Mongoose Model for mongodb schema
const User = require("./models/User");

//Passport JS Setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user._id); // Serialize the user by storing its ID in the session
});

passport.deserializeUser(function (id, done) {
  User.findById(id)
    .then((user) => {
      done(null, user); // Pass the user object to done
    })
    .catch((err) => {
      done(err, null);
    });
});

//Setup passport for local authentication from input recieved from the Login page. Verify if email/password
//exists in Mongodb
passport.use(
  "local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async function (req, email, password, done) {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Incorrect email" });
        }
        // Perform password validation here
        // ...
        // If password is valid:
        console.log(`local: `, user);
        return done(null, user); // Provide the user object to serialize
      } catch (error) {
        return done(error);
      }
    }
  )
);

//Rn .env file but dont store it using the const dontev
require("dotenv").config();

//Add mongodb
require("./mongodb");

//PORT
const { SERVER_PORT } = process.env;

//INSTALL NODEMAILER FOR OUR CONTACT PAGE
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

//CONFIGURE THE ZOHO MAILER ACCOUNT FOR OUR CONTACT PAGE
const mailTransporter = nodemailer.createTransport({
  service: "Zoho",
  auth: {
    user: "recipesphere@zohomail.com",
    pass: "june2023cohort",
  },
});

//Specify the PORT number on the local host to run server
const port = 3003; // Use your preferred port

// Set EJS as the view engine and middleware.
app.set("view engine", "ejs");
app.use(express.static("public")); // Serve static files from the 'public' folder
app.use(express.urlencoded({ extended: true })); // Parse form data in POST requests
// Parse incoming request data
app.use(bodyParser.urlencoded({ extended: true }));

// Define API credential and base URL
//EP: Adding our API ID and API key
const appId = "71deea61";
const appKey = "9572a22f509a714cdc8879798fb0ff78";
const baseUrl = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${appId}&app_key=${appKey}`;

// Create Routes using express Get method which has parameter for path and callback function.
//Landing page
app.get("/landing", (req, res) => {
  res.render("landing");
});

//Root to landing page too
app.get("/", (req, res) => {
  res.render("landing");
});

//GET: SIGNUP
app.get("/signup", (req, res) => {
  res.render("signup");
});

//POST: SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await User.create({
      fname: firstName,
      lname: lastName,
      email,
      password,
    });
    await user.save();
    res.redirect("login");
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send("Error during signup");
  }
});

//GET: LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login");
});

//POST: LOGIN PAGE
app.post("/login",  passport.authenticate("local", {
                    failureRedirect: "/login?success=false", // Redirect back to the login page on failure
                    }),
                    //IF the Loggin is successfull, get the users firstname to pass to the home page.
                    function (req, res) {

                    req.session.fname = req.user.fname;
                    req.session.email = req.user.email;
                    console.log(req.session.fname)
                    console.log(`session `, req.session.id)
                    console.log(`req.user._id `, req.user._id)
                    res.redirect("/home");
                    }
);


//GET: HOME PAGE is only accessible if user isLoggedIn=True
app.get("/home", isLoggedIn, (req, res) => {
  // Access the fname from the session
  const fname = req.session.fname;
  console.log("fname from session:", fname);
  res.render("home", { fname }); // Pass fname to the EJS template
});

//GET: About page to render
app.get("/about", (req, res) => {
  res.render("about");
});

//GET: Contact Page to render
app.get("/contact", (req, res) => {
  res.render("contact");
});



//GET: Logout 
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/?success=true");
  });
});



// DELETE USER
//EP: Tried to delete using ID but could not get it to work, so used
//email instead.
app.post("/delete", (req, res) => {
  const id = req.session.email.toString();
  console.log(`delete id`, id)

  // const userId =  new mongoose.Types.String(id);

console.log(`delete useremail` , id)
  // if (!mongoose.Types.String.isValid(id)) {
  //   return res.status(400).json("Invalid user ID");
  // }

  User.deleteOne({ email: id })
    .then(function (data) {
      //pass 'deltrue to landing page to let alert know account was deleted
      res.redirect("/?success=deltrue");
    })
    .catch((err) => {
      console.log(err);
      res.json("There was an error on delete");
    });``
});


//EP: SUBMIT CONTACT FORM TO ZOHO MAIL SERVER
app.post("/contact", (req, res) => {
  const { firstName, lastName, email, concerns } = req.body;

  const mailOptions = {
    from: "recipesphere@zohomail.com",
    to: "recipesphere@zohomail.com", // Change this to the recipient's email
    subject: "Contact Form Submission",
    text: `
      First Name: ${firstName}
      Last Name: ${lastName}
      Email: ${email}
      Concerns: ${concerns}
    `,
  };

  // Send email using mailTransporter
  mailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      // Redirect back to the contact page with a success query parameter
      res.redirect("/contact?success=true");
      // Send a JSON response indicating success
      //  res.json({ success: true });
    }
  });
}); //END APP.POST Mailer

// External API call for recipes with query parameters for user searching recipe.
app.get("/search", isLoggedIn, (req, res) => {
  //EP: The searchTerm will either default to 'desserts' if there's no
  //entry in the name=recipesearch input from the search.ejs page.
  const searchTerm = req.query.recipesearch || "desserts";
  //Set the baseUrl and append the searchTerm query
  const apiUrl = `${baseUrl}&q=${searchTerm}`;
  //Axios call to Edam food api
  axios
    .get(apiUrl)
    .then((response) => {
      // Store fetched recipes in the array
      const data = response.data;
      res.render("search.ejs", { data: data.hits, searchTerm }); //end res.render
    }) //end .then-response
    .catch((error) => {
      console.error("Error fetching recipes:", error);
      res.status(500).send("Error fetching recipes, API not working");
    }); //end .catch-error
});




const recipes = [];

app.get("/recipe", isLoggedIn,(req, res) => {
    res.render('recipe');
});

app.post('/recipe', isLoggedIn,(req, res) => {
    const recipe = {
        title: req.body.title,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        image: req.body.image
    };
    recipes.push(recipe);

    // Send a response indicating success
    res.status(200).send('Recipe submitted successfully!');
});

app.get('/recipes', isLoggedIn, (req, res) => {
    res.json(recipes);
});






// For user wrong entry: Middleware for handling 404 errors - Inside the middleware function, status code to 404,
//indicating that the resource was not found
// Handle 404 error
app.use((req, res) => {
  res.status(404).render('404.ejs');
});

// Middleware to check authentication for Home and Search page.
function isLoggedIn(req, res, next) {
  console.log(`authenticated: `, req.isAuthenticated());
  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    // If authenticated, user can continue to access page
    return next();
  }
  // If not authenticated, user gets kicket out to the login page
  res.redirect("/login");
}


// Start listen the server on the local PORT
app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});
