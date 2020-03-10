const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cors = require('cors')
require('dotenv').config()

// Create uploads folder if not exists
const fs = require('fs');
const uploadsdir = './uploads';
if (!fs.existsSync(uploadsdir)) {
	fs.mkdirSync(uploadsdir);
}
const indexRouter = require('./routes/index');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static(__dirname + '/upload'));
app.use('/', indexRouter);

// Mongodb Connection
mongoose
	.connect(process.env.MONGO_URL || "",
		{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
	.then(() => {
		console.log('DB Connection Successfull');
	})
	.catch(err => { console.log(err.message); });

module.exports = app;
