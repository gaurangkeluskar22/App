const { generateToken } = require("../auth/jwtAuthMiddleware")
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

        if(newUser){
            // save user to the database
            await newUser.save()

            res.status(200).json({
                success : true,
                message : "User has been created Successfully!"
            })
        }
        else{
            res.status(400).json({
                success : false,
                message : "Invalid User Data!"
            })
        }
    }
    catch(err){
        console.log("error:", err)
        res.status(400).json({
            success : false,
            message : "Server Error!"
        })
    }
}

const loginController = async (req, res) => {
    const body = req.body
    try{
        const user = await User.findOne({email : body.email})
        const isPasswordCorrect = await bcrypt.compareSync(body.password, user?.password)

        if(!user || !isPasswordCorrect){
            return res.status(400).json({
                message : "Invalid Email or Password !",
                success : false
            })
        }
        else if(user && isPasswordCorrect){
            const token = generateToken(user._id)
            res.status(200).json({
                success : true,
                token : token,
                userId : user._id,
                message : "Login Success!"
            })
        }
    }catch(err){
        res.status(400).json({
            success : false,
            message : "Database Error!"
        })
    }
}

const getUserDataController = async (req, res) => {
    const user = req.user
    try{
        res.status(200).json({
            success : true,
            result : user
        })
    }
    catch(err){
        res.status(400).json({
            success : false,
            message : "Database Error!"
        })
    }
}

module.exports = {signUpController, loginController, getUserDataController}