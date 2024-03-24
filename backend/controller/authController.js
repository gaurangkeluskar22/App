const User = require("../models/user.model")
const bcrypt = require('bcryptjs')


const signUpController = async (req, res) => {
    try{
        const body = req.body
        const user = await User.findOne({email : body.email})
        if(user){
            res.status(400).json({
                success : false,
                "message" : 'User already exists'
            })
        }
        
        // generate hash password
        const salt = bcrypt.genSaltSync(10)
        const hashedpassword = bcrypt.hashSync(body.password, salt)


        // generate Profile pic
        const malePic = `https://avatar.iran.liara.run/public/boy?username=${body.name}`
        const femalePic = `https://avatar.iran.liara.run/public/girl?username=${body.name}`

        const newUser = new User({
            name : body.name,
            email : body.email,
            password : hashedpassword,
            gender : body.gender,
            profilePic : body.gender === 'male' ? malePic : femalePic
        })

        await newUser.save()

        res.status(200).json({
            success : true,
            message : "User has been created Successfully!"
        })
    }
    catch(err){
        console.log("error:", err)
        res.status(400).json({
            success : false,
            message : "Server Error!"
        })
    }
}

const loginController = (req, res) => {
    const body = req.body
    res.status(200).json({
        success : true,
        message : "Hii"
    })
}

module.exports = {signUpController, loginController}