const express = require('express')
const routes = express.Router()

const productController = require('./app/controllers/productController')
const homeController = require('./app/controllers/homeController')
const searchController = require('./app/controllers/searchController')

const multer = require('./app/middlewares/multer')
//controllers são atribuidos à entidades

//home
routes.get('/', homeController.index)

//search
routes.get('/products/search', searchController.index)


//products
routes.get('/products/create', productController.create)
routes.get('/products/:id/edit', productController.edit)
routes.get('/products/:id', productController.show)

routes.post('/products', multer.array("photos", 6), productController.post)
routes.put('/products', multer.array("photos", 6), productController.put)

routes.delete('/products', productController.delete)


//atalhos-alias
routes.get('/ads/create',function(req, res) {
    return res.redirect("/products/create")
})



module.exports = routes