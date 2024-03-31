const { Server } = require("socket.io");
const http = require('http');
const express = require('express');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000'],
        methods: ["GET", "POST"]
    }
});

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

const getReceiverSocketId = async(receiverId) => {
    return await redisClient.redis.hget("userSocketMap",receiverId);
};

const getSenderSocketId = async(senderId) => {
    return await redisClient.redis.hget("userSocketMap",senderId);
};

// const userSocketMap = {};

io.on("connection", async (socket) => {
    console.log("a user connected:", socket.id);
    const userId = socket.handshake.query.userId;

    if (userId !== "undefined") {
        // userSocketMap[userId] = socket.id;
        await redisClient.redis.hset("userSocketMap", userId, socket.id);
    }

    // Get all userSocketMap entries from Redis
    const userSocketMapEntries = await redisClient.redis.hgetall("userSocketMap");
    const userSocketMap = Object.fromEntries(
        Object.entries(userSocketMapEntries).map(([userId, socketId]) => [userId, socketId])
    );

    console.log(userSocketMap);

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // socket.on() method is used to listen to the events. it can be used on both client and server side
    socket.on("disconnect", async() => {
        console.log("a user disconnected:", socket.id);
        // remove user from map
        await redisClient.redis.hdel("userSocketMap", userId);
        // Get updated userSocketMap after removal
        const updatedUserSocketMapEntries = await redisClient.redis.hgetall("userSocketMap");
        const updatedUserSocketMap = Object.fromEntries(
            Object.entries(updatedUserSocketMapEntries).map(([userId, socketId]) => [userId, socketId])
        );
        io.emit("getOnlineUsers", Object.keys(updatedUserSocketMap));
    });
});

module.exports = { app, io, server, getReceiverSocketId, getSenderSocketId, pub: redisClient.pub, sub: redisClient.sub };
