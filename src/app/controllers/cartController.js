const Cart = require('../../lib/cart')
const LoadProductService = require('../services/loadProductService')

module.exports = {
    async index(req, res) {
        try {
            const product = await LoadProductService.load('products', {where: {id:13}})

            let { cart } = req.session

            //gerenciador de carrinho
            cart = Cart.init(cart).addOne(product)
            console.log('carrin', cart)

            return res.render("cart/index", { cart })
        }
        catch(err) {
            console.log('error cart', err)
        }
    }
}