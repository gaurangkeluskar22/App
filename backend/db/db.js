const mongoose = require("mongoose");

const connectToMongoDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_DB_URI)
        console.log("Connected to mongoDB")
    }
    catch(err){
        console.log("Error:", err)
    }
}

module.exports =  connectToMongoDB