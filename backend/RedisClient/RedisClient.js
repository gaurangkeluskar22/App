const Redis = require('ioredis');
const { io } = require("../socket/socket")

const redisOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    tls: {},
    connect_timeout: 10000,
    maxRetriesPerRequest: 50
};

pub = new Redis(redisOptions);
sub = new Redis(redisOptions);
redis = new Redis(redisOptions);

// Add event listeners outside the constructor
pub.on('connect', () => {
    console.log('Pub Connected!');
});

sub.on('connect', () => {
    console.log('Sub Connected!');
});

redis.on('connect', () => {
    console.log('Redis Connected!');
});

// Handle Redis client errors
pub.on('error', (error) => {
    console.error('Error in Redis client:', error);
});

sub.on('error', (error) => {
    console.error('Error in Redis server:', error);
});

// subscribing to the channel
sub.subscribe('Message');



module.exports =  {pub, sub, redis}
