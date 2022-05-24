const express = require('express')
const routes = express.Router()

const sessionController = require('../app/controllers/sessionController')
const userController = require('../app/controllers/userController')
const orderController = require('../app/controllers/orderController')

const userValidator = require('../app/validators/user')
const sessionValidator = require('../app/validators/session')
const { isLoggedRedirectToUsers, onlyUsers } = require('../app/middlewares/session')

// //login/logout
routes.get('/login', isLoggedRedirectToUsers, sessionController.loginForm)
routes.post('/login', sessionValidator.login, sessionController.login)
routes.post('/logout', sessionController.logout)

// //reset password / forgot
routes.get('/forgot-password', sessionController.forgotForm)
routes.get('/password-reset', sessionController.resetForm)
routes.post('/forgot-password', sessionValidator.forgot, sessionController.forgot)
routes.post('/password-reset', sessionValidator.reset, sessionController.reset)

// //user register UserController - criar, atualizar, remover
routes.get('/register', userController.registerForm),
routes.post('/register', userValidator.post, userController.post),

routes.get('/', onlyUsers, userValidator.show, userController.show)
routes.put('/', userValidator.update, userController.update),
routes.delete('/', userController.delete)

routes.get('/ads', userController.ads)



module.exports = routes