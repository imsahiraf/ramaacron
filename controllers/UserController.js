const jwt = require('jsonwebtoken');

class UserController {
	constructor(userRepository, secret) {
		this.userRepository = userRepository;
		this.secret = secret;
	}

	login = (req, res) => {
		const { username, password } = req.body;

		this.userRepository.findOne(username)
			.then(user => {
				if (!user) {
					res.status(401).send('Invalid username or password');
					return;
				} else {
					// First check if the user is already logged in or not
					if (user.username && this.userRepository.isLoggedIn(user.username)) {
						res.status(402).send('You are already logged in!');
					} else if (user && user.password === password) {
						// Generate JWT token with the secret key from the UserController instance
						const token = jwt.sign({ username }, this.secret);
						res.status(200).send(token);
					} else {
						res.status(401).send('Invalid username or password');
					}
				}
			})
			.catch(err => {
				console.error(err);
				res.status(500).send('Error retrieving user from database');
			});
	};
}

module.exports = UserController;
