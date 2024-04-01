const express = require('express');
require('dotenv').config();
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const messageRouter = require('./routes/messageRouter');
const connectToMongoDB = require('./db/db');
const port = process.env.SERVER_PORT;
const cors = require('cors');
const { app, server } = require('./socket/socket');

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/message', messageRouter);


async function init() {
    server.listen(port, () => {
        connectToMongoDB();
        console.log("app is listening on PORT:", port);
    });
}

init();