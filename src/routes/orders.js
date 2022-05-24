const express = require('express')
const routes = express.Router()

const orderController = require('../app/controllers/orderController')
const { onlyUsers } = require('../app/middlewares/session')


routes.post('/', onlyUsers, orderController.post)
routes.get('/', onlyUsers, orderController.index)

module.exports = routes