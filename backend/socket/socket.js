const { Server } = require("socket.io");
const http = require('http');
const express = require('express');
const {redisClient} = require('../RedisClient/RedisClient')

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000'],
        methods: ["GET", "POST"]
    }
});


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

module.exports = { app, io, server };
