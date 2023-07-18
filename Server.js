const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocketServer = require('./WebSocketServer');
const UserController = require('./controllers/UserController');
const UserRepository = require('./repositories/UserRepository');
const RedisSubscriber = require('./services/RedisSubscriber');

require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/websocketdemo');

// Dependency injection
const userRepository = new UserRepository(mongoose);
const redisSubscriber = new RedisSubscriber();

// Controllers
const secret = process.env.JWT_SECRET; // Access the secret key from environment variables
const userController = new UserController(userRepository, secret);
const webSocketServer = new WebSocketServer(redisSubscriber, userRepository, secret);

// Routes
app.post('/login', userController.login);

// Start the WebSocket server
webSocketServer.start();

// Start the Express server
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
