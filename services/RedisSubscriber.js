const Redis = require('ioredis');

class RedisSubscriber {
	constructor() {
		this.subscriber = new Redis();
	}

	subscribe(channels) {
		this.subscriber.subscribe(channels);
	}

	onMessage(callback) {
		this.subscriber.on('message', callback);
	}

	unsubscribe() {
		this.subscriber.unsubscribe();
	}
}

module.exports = RedisSubscriber;
