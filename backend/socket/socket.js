const { Server } = require("socket.io");
const http = require('http');
const express = require('express');
const {pub, sub, redis} = require('../RedisClient/RedisClient')

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
        await redis.hset("userSocketMap", userId, socket.id);
    }

    // Get all userSocketMap entries from Redis
    
    const userSocketMapEntries = await redis.hgetall("userSocketMap");
    const userSocketMap = Object.fromEntries(
        Object.entries(userSocketMapEntries).map(([userId, socketId]) => [userId, socketId])
    );

    console.log(userSocketMap);

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", userSocketMap);

    socket.on("user:call", (data)=>{
        const {to, offer} = data
        io.to(to).emit('user:incomming:call', {from : socket.id, offer})
    })

    socket.on("user:call:accepted", (data)=>{
        const {to, ans} = data
        io.to(to).emit('user:call:accepted', {from : socket.id, ans})
    })

    socket.on("peer:nego:needed", ({ to, offer }) => {
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
      });
    
      socket.on("peer:nego:done", ({ to, ans }) => {
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
      });

      socket.on("call:end", (data)=>{
        const {to} = data
        io.to(to).emit("call:ended")
      })
    
    // socket.on() method is used to listen to the events. it can be used on both client and server side
    socket.on("disconnect", async() => {
        console.log("a user disconnected:", socket.id);
        // remove user from map
        
        await redis.hdel("userSocketMap", userId);
        // Get updated userSocketMap after removal
        const updatedUserSocketMapEntries = await redis.hgetall("userSocketMap");
        const updatedUserSocketMap = Object.fromEntries(
            Object.entries(updatedUserSocketMapEntries).map(([userId, socketId]) => [userId, socketId])
        );
        io.emit("getOnlineUsers", Object.keys(updatedUserSocketMap));
    });
});

// listen to the message comming from redis
sub.on('message', async(channel, message)=>{
    console.log('Received message:', message);
    if(channel === 'Message'){
        const decodedMessage =  JSON.parse(message)
        // emit message to sender and receiver
        const receiverSocketId = await redis.hget("userSocketMap", decodedMessage?.newMessage?.receiverId);
        
        const senderSocketId = await redis.hget("userSocketMap",decodedMessage?.newMessage?.senderId)

        if(receiverSocketId){
            console.log("here")
            io.to(receiverSocketId).emit("newMessage", decodedMessage?.newMessage)
        }

        if(senderSocketId){
            io.to(senderSocketId).emit("newMessage", decodedMessage?.newMessage)
        }
    }
})

module.exports = { app, io, server };
