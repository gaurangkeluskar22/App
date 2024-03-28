const { Server } =  require("socket.io")
const http = require('http')
const express = require('express')
const Redis = require('redis')


const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors:{
        origin : ['http://localhost:3000'],
        methods : ["GET","POST"]
    }
})

// initializing redis
const redisOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.PORT,
    username : process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    tls : {},
    connect_timeout: 10000,
    maxRetriesPerRequest : 50
};

const pub = Redis.createClient(redisOptions);
const sub = Redis.createClient(redisOptions);

// subscribing to the channel
sub.subscribe('Message')


const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId]
}
const getSenderSocketId = (senderId) => {
    return userSocketMap[senderId]
}

const userSocketMap = {}

io.on("connection", (socket)=>{
    console.log("a user connected:", socket.id)
    const userId = socket.handshake.query.userId
    
    if(userId !== "undefined"){
        userSocketMap[userId] = socket.id
    }
    
    console.log(userSocketMap)

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    // socket.on() method is used to listen to the events. it can be used on both client and server side
    socket.on("disconnect", ()=>{
        console.log("a user disconnected:", socket.id)
        // remove user from map
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})


module.exports = {app, io, server, getReceiverSocketId, getSenderSocketId, pub, sub}