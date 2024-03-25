const router = require('express').Router()
const { jwtAuth } = require('../auth/jwtAuthMiddleware')
const {getAllUsers} = require('../controller/userController')

router.get('/allUsers', jwtAuth ,getAllUsers)


module.exports = router

