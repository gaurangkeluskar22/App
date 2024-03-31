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

const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const getSenderSocketId = (senderId) => {
    return userSocketMap[senderId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);
    const userId = socket.handshake.query.userId;

    if (userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    console.log(userSocketMap);

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // socket.on() method is used to listen to the events. it can be used on both client and server side
    socket.on("disconnect", () => {
        console.log("a user disconnected:", socket.id);
        // remove user from map
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

module.exports = { app, io, server, getReceiverSocketId, getSenderSocketId, pub: redisClient.pub, sub: redisClient.sub };
