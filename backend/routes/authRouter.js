const router = require('express').Router()
const {signUpController, loginController, getUserDataController} = require('../controller/authController')
const {jwtAuth} = require('../auth/jwtAuthMiddleware')

router.post('/signup', signUpController)
router.post('/login', loginController)
router.get("/getUserData", jwtAuth, getUserDataController)

module.exports = router