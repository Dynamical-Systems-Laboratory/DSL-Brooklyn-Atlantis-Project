var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var bcrypt = require ("bcrypt");


const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'atlantis2020',
  database: 'testDB'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});


var app = express();
app.use(session({
	secret: 'secret', //change this to some complicated key upon realisation
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json()); //using express and bodyParser as middleware, serialise incoming request as .json data

app.get('/', function(request, response) { //at localhost:3000/
	//response.sendFile(path.join(__dirname + '/test_page.html'));           //this is to directly login page
	response.sendFile(path.join(__dirname + '/register.html'));				//this is to register page first
}); 

app.get('/login', function(request,response) {
	response.sendFile(path.join(__dirname + '/test_page.html'));
})

	//register form with bcrypt
app.post('/register', async function(request, response) {
	const password = request.body.password;
	const saltRounds = 10; //Salt rounds can be changed
	const encryptedPassword = await bcrypt.hash (password, saltRounds)

	var accounts={
		"username":request.body.username,
		"password":encryptedPassword,
		"email":"test"
	}

	connection.query('INSERT INTO accounts SET ?', accounts, function (error, results, fields) {
		if (error) {
			response.send('Something went wrong');
			console.log (error);
			response.end();
		} else {
			response.redirect('/login');
			response.end();
		}	
	});
});

	//login form with bcrypt
app.post('/auth', async function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ?', [username], async function(error, results, fields) {
			if (error) {
				response.send('Something went wrong');
			} else {
				if (results.length > 0) {
					const comparison = await bcrypt.compare(password, results[0].password)
					if (comparison) {
						request.session.loggedin = true;
						request.session.username = username;
						response.redirect('/home')
					} 
					else {
						response.send('Username and password does not match');
					}
				} 
				else {
					response.send('Username does not exist');
				}			
				response.end();
			}});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});






/*    
	//Login form without bcrypt
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
*/


app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(3000);