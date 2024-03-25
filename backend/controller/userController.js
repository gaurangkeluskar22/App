const User = require("../models/user.model")

const getAllUsers = async (req, res) => {
    try{
        const users = await User.find()
        res.status(200).json({
            success : true,
            results : users
        })
    }
    catch(err){
        console.log(err)
        res.status(400).json({
            success : false,
            message :"Database Error!"
        })
    }
}


module.exports = {getAllUsers}