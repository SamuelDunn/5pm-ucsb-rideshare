const express = require("express");
const expHandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const secret = require("./config/secret.js");
const oauth = require("./config/oauth.js");
const passport = require("passport");
const session = require("express-session");

// Requiring the database
const db = require("./config/database.js");

// Checking the database for connection/errors
db.authenticate()
	.then(function() {
		console.log("Connected to database");
	})
	.catch(function(err) {
		console.log("Database Error: " + err);
	})


// Initialize the express variable for routes
const app = express();


app.use(session({ secret:secret }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());



// Setting up the template engine
app.engine("handlebars", expHandlebars({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// // Setting static folder for css and images
app.use(express.static(path.join(__dirname, "static")));

// Redirecting bootstrap and jquery files from node_modules directory to static
// Redirect bootstrap js
app.use("/static/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
// Redirect jquery js
app.use("/static/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));
// Redirect bootstrap css
app.use("/static/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));


// Middleware for bodyparser
app.use(bodyParser.urlencoded({extended: false}));

// Test user in session
function isAuthed(req,res,next){
    if(req.session.passport.user){
	next();
    }
    else
    {
	res.redirect('/auth');
    }
}

// Home route
app.get("/", function(request, response) {
	response.render("index");
});

app.get("/callback", oauth.authenticate("google", {failureRedirect: "/"}), 
	function(request, response) {
		response.redirect("/");
});

app.get('/auth',oauth.authenticate('google',{scope:['profile']}));

// Setting routes for rides
app.use("/rides", isAuthed, require("./routes/rides"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, function() {
	console.log(`Server started on port ${PORT}`);
});
