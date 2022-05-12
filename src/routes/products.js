const express = require('express')
const routes = express.Router()


const productController = require('../app/controllers/productController')
const searchController = require('../app/controllers/searchController')
const multer = require('../app/middlewares/multer')

const { onlyUsers } = require('../app/middlewares/session')
const Validator = require('../app/validators/product')

//search
routes.get('/search', searchController.index)
routes.get('/create', onlyUsers, productController.create)
routes.get('/:id/edit', onlyUsers, productController.edit)
routes.get('/:id', productController.show)

routes.post('/', onlyUsers, multer.array("photos", 6), Validator.post, productController.post)
routes.put('/', onlyUsers, multer.array("photos", 6), Validator.put, productController.put)

routes.delete('/', onlyUsers, productController.delete)

module.exports = routes