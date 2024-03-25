const jwt = require('jsonwebtoken')

const jwtAuth = (req, res, next) => {
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
        req.user = decoded;
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