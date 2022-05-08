const Products = require('../models/product')
const file = require('../models/file')
const { formatPrice } = require('../../lib/date')
const LoadProductService = require('../services/loadProductService')

module.exports = {
    async index(req, res) {
        try {

            const allProducts = await LoadProductService.load('products')
            const products = allProducts.filter((product, index) => index > 2 ? false : true)
            console.log(products)
            return res.render("home/index", { products })
        }
        catch(err) {
            console.log('erroHome', err)
        }
    }
}