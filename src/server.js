const express = require('express');
const port = 4000;
const app = express();
const nano = require('nano')('http://localhost:5984');
const cors = require('cors');

const users = nano.db.use('users');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/getuser', (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	const emailId = req.query.email;
	if (emailId === undefined) {
		res.send({
			"error": "parameter missing: emailId",
		});
	}

	users.get(emailId).then((body) => {
		res.send(body);
	});
});

app.post('/adduser', (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	const emailId = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	if (emailId === undefined || username === undefined || password === undefined) {
		res.send({"message": "Missing emailId, password or username",});
	}

	users.get(emailId).then(() => {
	    res.send({message: "Already registered! Please login"});
  	}).catch(() => {
        users.insert({
	        _id: emailId,
	      	username,
	      	password,
	      	emailId,
    	}).catch(() => {
    		// error
    	});
		res.send({message: "success"});		
  	});
});

app.get('/validateuser', (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	const emailId = req.query.email;
	const password = req.query.password;
	if (emailId === undefined || password === undefined) {
		res.send({"message": "Missing emailId or password"});
	}

	users.get(emailId).then(doc => {
    if(doc.password === password) {
    	const user = {
        	emailId: doc._id,
        	username: doc.username,
      	};
    	res.send(user);
    } else {
    	res.send({message: "Wrong Password!"});
    }
  	}).catch(err => {
	  	res.send({message: "Check email ID or register first!"});
  	});
});

app.listen(port, () => console.log(`Sample App listening on port ${port}!`));