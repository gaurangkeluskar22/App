const router = require('express').Router()
const { jwtAuth } = require('../auth/jwtAuthMiddleware')
const {sendMessageController, getMessasgesController} = require('../controller/messageController')

router.post('/send/:id', jwtAuth,sendMessageController)
router.get('/getmessages/:id', jwtAuth, getMessasgesController)

module.exports = router