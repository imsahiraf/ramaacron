const jwt = require('jsonwebtoken');
const WebSocket = require('ws');

class WebSocketServer {
	constructor(redisSubscriber, userRepository, secret) {
		this.wss = new WebSocket.Server({ port: 8081 });
		this.redisSubscriber = redisSubscriber;
		this.userRepository = userRepository;
		this.secret = secret;
	}

	start() {
		this.wss.on('connection', (ws, req) => {
			// Wait for the initial message from the client containing the username and password
			ws.once('message', message => {
				const data = JSON.parse(message);
				const { token, channels } = data;

				if (!token) {
					console.log(token);
					ws.close();
					return;
				}

				jwt.verify(token, this.secret, (err, decoded) => {
					if (err) {
						console.log(err);
						ws.close();
						return;
					}

					console.log('Token verified:', decoded);

					// Add the user to the list of logged in users
					const user = decoded.username;
					if (user) {
						this.userRepository.addUser(user);
					} else {
						console.log(`User ${decoded.username} not found in database`);
					}

					console.log(this.userRepository.loggedInUsers);

					this.redisSubscriber.subscribe(channels);

					this.redisSubscriber.onMessage((channel, message) => {
						ws.send(JSON.stringify(message));
						// console.log(`Received data from channel ${channel}: ${message}`);
					});

					ws.on('close', () => {
						console.log('Client disconnected');

						// Unsubscribe and clean up the Redis subscriber
						this.redisSubscriber.unsubscribe();

						// Remove the user from the list of logged in users
						this.userRepository.removeUser(decoded.username);
					});
				});
			});
		});
	}
}

module.exports = WebSocketServer;
