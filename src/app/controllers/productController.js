const category = require('../models/category')
const products = require('../models/product')
const file = require('../models/file')
const { formatPrice } = require('../../lib/date')

module.exports = {
    async create(req, res) {
        //pegar categorias
        category.all().then(function(results) {
            const categories = results.rows
            return res.render("products/create.njk", {categories})
        }).catch(function(err) {
            throw new Error(err)
        })
        
    },
    async post(req, res) {
        const keys = Object.keys(req.body)

        for(key of keys) {
            if(req.body[key] == "") {
                return res.send('Please, fill all fields!')
            }
        }

        if (req.files.length === 0) {
            return res.send("Please, send at least one image")
        } 

        let results = await products.create(req.body) 
        const productId = results.rows[0].id
        debugger;
        const filesPromise = req.files.map(fileItem => file.create({ ...fileItem, product_id: productId}))
        await Promise.all(filesPromise).catch(error => console.log(error))
        
        return res.redirect(`/products/${productId}/edit`)
    },
    async edit(req, res) {
        let results = await products.find(req.params.id) 
        const product = results.rows[0]

        if(!product) {
            return res. send("Product not found!")
        }

        product.price = formatPrice(product.price)
        product.old_price = formatPrice(product.old_price)

        //get categories
        results = await category.all()
        const categories = results.rows

        //get images

        results = await products.files(product.id)
        let files = results.rows
        files = files.map(file => ({
            ...file,
            src: `${req.protocol}://${req.header.host}${file.path}`
        }))

        return res.render("products/edit.njk", {product, categories})
    
    },
    async put(req, res) {
        const keys = Object.keys(req.body)

        for(key of keys) {
            if(req.body[key] == "") {
                return res.send('Please, fill all fields!')
            }
        }

        req.body.price = req.body.price.replace(/\D/g, "")

        if (req.body.old_price != req.body.price) {
            const oldProduct = await products.find(req.body.id)
            req.body.old_price = oldProduct.rows[0].price
        }

        await products.update(req.body)

        return res.redirect(`/products/${req.body.id}/edit`)
    },
    async delete(req, res) {
        await products.delete(req.body.id)

        return res.redirect('/products/create')
    }
}