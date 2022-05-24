const mailer = require('../../lib/mailer')
const LoadProductService = require('../services/loadProductService')

const LoadOrderService = require('../services/loadOrderService')
const User = require('../models/user')
const Order = require('../models/order')
const Cart = require('../../lib/cart')

const email = (seller, product,buyer) => `
    <h2>Olá ${seller.name}</h2>
    <p>Você tem um novo pedido de compra do seu produto</p>
    <p>Produto ${product.name}</p>
    <p>Preço ${product.formattedPrice}</p>
    <p><br/><br/></p>
    <h3>Dados do comprador</h3>
    <p>Nome: ${buyer.name}</p>
    <p>Email: ${buyer.email}</p>
    <p>Endereço: ${buyer.address}</p>
    <p><br/><br/></p>
    <strong>Entre em contato com o comprador para finalizar a venda!</strong>
    <p><br/><br/></p>
    <p>Atenciosamente, Equipe Launchstore</p>
`

module.exports = {
    async index(req, res) {
        //pegar os pedidos do usuário
        const orders = await LoadOrderService.load('orders', {
            where: { buyer_id: req.session.userId }
        })
        
        return res.render('orders/index', { orders })
    },
    async post(req, res) {
        try {
            //pegar produtos do carrinho
            const cart = Cart.init(req.session.cart)

            const buyer_id = req.session.userId

            const filteredItems = cart.items.filter(item => {
                return item.product.user_id !== buyer_id
            })
            console.log('postCart', cart)
            console.log('filtrado', filteredItems)

            //criar o pedido

            const createOrdersPromise = filteredItems.map(async item => {
                let { product, price: total, quantity } = item
                const { price, id: product_id, user_id: seller_id } = product
                const status = "open"

                const order = await Order.create({
                    seller_id,
                    buyer_id,
                    product_id,
                    price,
                    total,
                    quantity,
                    status
                })

                //pegar dados do produto
                console.log(item, 'itemm')
                product = await LoadProductService.load('product', {where: {
                    id: product_id
                }})
                //dados do vendedor
                const seller = await User.findOne({where: {id: seller_id}})

                //dados do comprador
                const buyer = await User.findOne({where: {id: buyer_id}})

                //enviar email com dados da compra para o vendedor
                await mailer.sendMail({
                    to: seller,
                    from: 'no-reply@launchstore.com.br',
                    subject: 'Novo pedido de compra',
                    html: email(seller, product, buyer)
                })

                return order
            })

            await Promise.all(createOrdersPromise)

            //limpar o carrinho
            delete req.session.cart
            Cart.init()

           //notificar o usuario com alguma mensagem de sucesso ou erro
           return res.render('orders/success')
        }
        catch(err) {
            console.log('erroOrder', err)
            return res.render('orders/error')
        }
    },
    async sales(req, res) {
        const sales = await LoadOrderService.load('orders', {
            where: { seller_id: req.session.userId }
        })
        
        return res.render('orders/sales', { sales })
    },
    async show(req, res) {
        const order = await LoadOrderService.load('order', {
            where: {id: req.params.id}
        })

        return res.render('orders/details', {order})
    },
    async update(req, res) {
        try {
            const { id, action } = req.params

            const acceptedActions = ['close', 'cancel']

            if(!acceptedActions.includes(action)) {
                return res.send('Cant do this action')
            } 

            //pegar o pedido
            const order = await Order.findOne({
                where: {id}
            })
            //verificar se ele esta aberto
            if(!order) return res.send("Order not found")
            if(order.status !== 'open') return res.send("cant do this actions")
            //atualizar o pedido
            const statuses = {
                close: 'sold',
                cancel: 'canceled'
            }
            order.status = statuses[action]
            await Order.update(id, {
                status: order.status
            })
            //redirecionar
            return res.redirect('/orders/sales')
        } catch (error) {
            console.error(error)
        }
    }
}