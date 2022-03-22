const express = require('express')
const routes = express.Router()


const productController = require('../app/controllers/productController')
const searchController = require('../app/controllers/searchController')
const multer = require('../app/middlewares/multer')

//search
routes.get('/search', searchController.index)


/
routes.get('/create', productController.create)
routes.get('/:id/edit', productController.edit)
routes.get('/:id', productController.show)

routes.post('/', multer.array("photos", 6), productController.post)
routes.put('/', multer.array("photos", 6), productController.put)

routes.delete('/', productController.delete)

module.exports = routes