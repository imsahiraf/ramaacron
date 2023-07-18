class UserRepository {
	constructor(mongoose) {
		this.User = mongoose.model('User', {
			username: String,
			password: String
		});
		this.loggedInUsers = [];
	}

	findOne(username) {
		return this.User.findOne({ username });
	}

	isLoggedIn(username) {
		return this.loggedInUsers.includes(username);
	}

	addUser(username) {
		this.loggedInUsers.push(username);
	}

	removeUser(username) {
		const index = this.loggedInUsers.findIndex(u => u === username);
		if (index !== -1) {
			this.loggedInUsers.splice(index, 1);
		}
	}
}

module.exports = UserRepository;
