const mailer = require('../../lib/mailer')
const LoadProductService = require('../services/loadProductService')
const User = require('../models/user')
const Order = require('../models/order')
const Cart = require('../../lib/cart')
const { formatPrice, date } = require('../../lib/date')

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
        let orders = await Order.findAll({where: {buyer_id: req.session.userId}})

        const getOrdersPromise = orders.map(async order => {
            //detalhes do produto
            order.product = await LoadProductService.load('products', {
                where: { id: order.product_id}
            })
            //detalhes do comprador
            order.buyer = await User.findOne({
                where: { id: order.buyer_id }
            })
            //detalhes do vendedor
            order.seller = await User.findOne({
                where: { id: order.seller_id }
            })

            // formatação
            order.formattedPrice = formatPrice(order.price)
            order.total = formatPrice(order.total)

            const statusUse = {
                open: 'Aberto',
                sold: 'Vendido',
                canceled: 'Cancelado'
            }

            order.formattedStatus = statusUse[order.status]
            const updatedAt = date(order.updatedAt)
            order.formattedUpdatedAt = `${order.formattedStatus} em ${updatedAt.day}/${updatedAt.month}/${updatedAt.year} às ${updatedAt.hour}h${updatedAt.minutes}`
            
            return order
        })

        orders = await Promise.all(getOrdersPromise)

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
    }
}