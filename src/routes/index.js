const express = require('express')
const routes = express.Router()

const homeController = require('../app/controllers/homeController')

const products = require('./products')
const users = require('./users')
const cart = require('./cart')
const orders = require('./orders')

//controllers são atribuidos à entidades

routes.use('/users', users)
routes.use('/products', products)
routes.use('/cart', cart)
routes.use('/orders', orders)

//home
routes.get('/', homeController.index)


//atalhos-alias
routes.get('/ads/create',function(req, res) {
    return res.redirect("/products/create")
})

routes.get('/accounts', function(req, res) {
    return res.redirect("/users/login")
})

module.exports = routes