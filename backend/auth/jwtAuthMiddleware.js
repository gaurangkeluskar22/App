const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

const jwtAuth = async (req, res, next) => {
    // extract token from request
    if(!req.headers.authorization){
        res.status(400).json({
            success : false,
            message : 'Unauthorized!'
        })
    }

    const token = req.headers.authorization.split(' ')[1]
    if(!token){
        res.status(400).json({
            success : false,
            message : 'Unauthorized!'
        })  
    }
    try{
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECREAT)
        
        if(!decoded){
            res.status(400).json({
                success: false,
                message: 'Invalid Token'
            })
        }
        const user = await User.findById(decoded.userId)    
        if(!user){
            res.status(400).json({
                success : false,
                message : 'User not found!'
            })
        }

        req.user = user;
        next()
    }
    catch(err){
        console.log(err);
        res.status(400).json({
            success : false,
            message: 'Invalid token!'
        })
    }
}


const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECREAT, {expiresIn : '15d'})
}


module.exports = {generateToken, jwtAuth}