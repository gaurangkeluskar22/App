const express = require('express')
require('dotenv').config()
const authRouter = require('./routes/authRouter')
const connectToMongoDB = require('./db/db')
const port = process.env.SERVER_PORT

const app = express()

app.use(express.json())
app.use('/api/auth', authRouter)



app.listen(port, ()=>{
    connectToMongoDB()
    console.log("app is listening on PORT:", port)
})