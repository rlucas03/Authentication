//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

console.log(process.env.API_KEY);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
	extended: true
})); 

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

// now to setup our new user database so to do that we create a user schema
// and our user schema is a very simple javascript object
const userSchema = new mongoose.Schema ({
	email: String,
	password: String
});

// const secret = 'Thisisourlittlesecret.'; // moved to .env file
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


// now we can user our userSchema to setup a new user model
// and then we have to specifcy the name of our collection which is User in singular form in mongoose.model('User')
// and it's going to be created using the userSchema that we made above
const User = new mongoose.model('User', userSchema);

// targetting the home route or the 'route' route
app.get('/', function(req, res){
	res.render('home');
});

app.get('/login', function(req, res){
	res.render('login');
});

app.get('/register', function(req, res){
	res.render('register');
});

app.post('/register', function(req, res){
	// our newUser is created using our User model above ^
	const newUser = new User({
		email: req.body.username,
		password: req.body.password
	});

// if the user has been registered in our DB
// they should be able to see the secrets page
	newUser.save(function(err){
		if (err) {
			console.log(err);
		} else {
			res.render('secrets');
		}
	});
});

app.post('/login', function(req, res){
	const username = req.body.username;
	const password = req.body.password;

// look through our collection of users where the email field is matching with our username field.
	User.findOne({email: username}, function (err, foundUser){
		if (err) {
			console.log(err);
		} else {
			if (foundUser) {
				if (foundUser.password === password) {
					res.render('secrets');
				} 
			}
		}
	});
});









app.listen(3000, function(){
	console.log(`Server started on port 3000`)
});