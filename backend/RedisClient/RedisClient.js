const Redis = require('ioredis');

// Singleton pattern for Redis pub/sub clients
class RedisClient {
    constructor() {
        if (!RedisClient.instance) {
            const redisOptions = {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                username: process.env.REDIS_USER,
                password: process.env.REDIS_PASSWORD,
                tls: {},
                connect_timeout: 10000,
                maxRetriesPerRequest: 50
            };
            this.pub = new Redis(redisOptions);
            this.sub = new Redis(redisOptions);
            this.redis = new Redis(redisOptions);

            this.pub.on('connect', () => {
                console.log('Pub Connected!');
            });

            this.sub.on('connect', () => {
                console.log('Sub Connected!');
            });

            // Handle Redis client errors
            this.pub.on('error', (error) => {
                console.error('Error in Redis client:', error);
            });

            // Handle Redis client errors
            this.sub.on('error', (error) => {
                console.error('Error in Redis server:', error);
            });

            // subscribing to the channel
            this.sub.subscribe('Message');

            RedisClient.instance = this;
        }
        return RedisClient.instance;
    }
}

const redisClient = new RedisClient();

module.exports = {redisClient}