const express = require("express");
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config.js');

const goalController = require('./controllers/goal');
const Goal = require('./models/goal');
const goalValidator = require('./validation/goal');

// Create our Express application
var app = express();
app.set('port', process.env.PORT || config.servercfg.port);

// Connect to the MongoDB
mongoose.connect(config.mongocfg.url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongo DB connection error:'));
db.once('open', function () {
  console.log("db connected successfully.");
});

app.use('/', function(req, res, next)  {
  console.log('Got A Hit to: ' + req.path + " : " + Date.now());
  next();
});

// Use the body-parser package in our application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressValidator());
app.use(function (err, req, res, next) {
  if (err.isBoom) {
    return res.status(err.output.statusCode).json(err.output.payload);
  }
});

//Create endpoint handlers for /goal
app.route('/api/goal')
.post(goalValidator.validateGoal, goalController.saveGoal);

app.route('/api/goal/:goalId')
.get(goalValidator.validateGoalId, goalController.getGoalByGoalId)
.put(goalValidator.validateGoal, goalController.updateGoal)
.delete(goalValidator.validateGoalId, goalController.deleteGoal);

app.route('/api/goal/user/:userId')
.get(goalValidator.validateUserId, goalController.getGoalsByUserId);

app.route('/api/sipcalculator')
.get(goalController.calculatePeriodicContribution);

app.route('/api/admin/recentgoal')
.delete(goalController.deleteRecentGoal);

//Starting the server
module.exports = app.listen(app.get('port'),function () {
  console.log('Server listen on : ' + app.get('port'));
});
