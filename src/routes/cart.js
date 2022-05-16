const express = require('express')
const routes = express.Router()

const cartController = require('../app/controllers/cartController')


routes.get('/', cartController.index)


module.exports = routes