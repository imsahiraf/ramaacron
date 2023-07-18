const axios = require('axios');
const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

class RedisPublisher {
	constructor() {
		this.redisClient = new Redis({
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
		});
	}

	publish(channel, data) {
		return this.redisClient.publish(channel, JSON.stringify(data));
	}

	quit() {
		return this.redisClient.quit();
	}
}

class DataProcessor {
	constructor() {
		this.redisPublisher = new RedisPublisher();
		this.allowPublishFlags = {};
	}

	async fetchDataFromApi() {
		try {
			const requestData = ["1.215464882", "1.215582003"]; // Example data, replace with actual data retrieval logic

			if (requestData) {
				const response = await axios.post(process.env.API_URL, requestData, {
					headers: {
						'Content-Type': 'application/json'
					}
				});
				const responseData = response.data;

				this.processData(responseData);
			}
		} catch (error) {
			console.error('Failed to fetch data from API:', error);
		}
	}

	processData(data) {
		data.data.items.forEach((item) => {
			const marketName = `Market_${item.market_id}`;

			if (!this.allowPublishFlags.hasOwnProperty(marketName)) {
				this.allowPublishFlags[marketName] = true;
			}

			const marketData = {
				marketName,
				...item
			};

			this.publishData(process.env.REDIS_CHANNEL_ONE + marketName, marketData);

			if (this.allowPublishFlags[marketName]) {
				this.allowPublishFlags[marketName] = false;
				setTimeout(() => {
					this.allowPublishFlags[marketName] = true;
					this.publishData(process.env.REDIS_CHANNEL_TWO + marketName, marketData);
				}, process.env.REDIS_SECOND_CHANNEL_DELAY_TIME);
			}
		});
	}

	publishData(channel, data) {
		this.redisPublisher.publish(channel, JSON.stringify(data));
	}

	quit() {
		this.redisPublisher.quit();
	}
}

class App {
	constructor() {
		this.dataProcessor = new DataProcessor();
	}

	start() {
		setInterval(() => this.dataProcessor.fetchDataFromApi(), process.env.API_RATE_PER_SECOND);
		process.on('SIGINT', () => this.shutdown());
	}

	shutdown() {
		this.dataProcessor.quit();
		process.exit();
	}
}

const app = new App();
app.start();
