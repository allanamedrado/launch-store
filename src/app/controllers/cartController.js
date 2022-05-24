const Cart = require('../../lib/cart')
const LoadProductService = require('../services/loadProductService')

module.exports = {
    async index(req, res) {
        try {
             let { cart } = req.session

            //gerenciador de carrinho
            cart = Cart.init(cart)

            return res.render("cart/index", { cart })
        }
        catch(err) {
            console.log('error cart', err)
        }
    },
    async addOne(req, res) {
        //pegar o id do produto e o produto
        const { id } = req.params;
        const product = await LoadProductService.load('products', {where: {id}})

        //pegar o carrinho da sessão
        let { cart } = req.session

        //adicionar o produto ao carrinho usando o gerenciador de carrinho
        cart = Cart.init(cart).addOne(product)

        //atualizar o carrinho da sessão 
        req.session.cart = cart

        //redirecionar o usuário para a tela do carrinho
        return res.redirect('/cart')
    },
    removeOne(req, res) {
        //pegar carrinho da sessão e pegar id
        const { id } = req.params
        let { cart } = req.session

        //se não tiver carinho, return
        if (!cart) return res.redirect('/cart')

        //iniciar o carinho com o gerenciador de carrinho
        cart = Cart.init(cart).removeOne(id)

        //atualizar o carrinho da sessao, removendo um item
        req.session.cart = cart

        //redirecionar para a pagina cart
        return res.redirect('/cart')
    },
    delete(req, res) {
        let { cart } = req.session;
        const { id } = req.params

        if(!cart) return;

        req.session.cart = Cart.init(cart).delete(id)

        return res.redirect('/cart')
    }
}