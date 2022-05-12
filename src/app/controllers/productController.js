const Category = require('../models/category')
const Products = require('../models/product.js')
const file = require('../models/file')
const fs = require('fs')
const LoadProductsService = require('../services/loadProductService')


module.exports = {
    async create(req, res) {
        try {
            const categories = await Category.findAll()

            return res.render("products/create.njk", {categories})
        } catch (error) {
            console.log('erroP1',error)
        }
        
    },
    async post(req, res) {
        try {
            

            let { category_id, name, description, old_price, price, quantity, status } = req.body

            price = price.replace(/\D/g, "")

            const productId = await Products.create({
                category_id, user_id: req.session.userId, name, description, old_price: old_price || price, price, quantity, status: status || 1
            })

            const filesPromise = req.files.map(fileItem => file.create({ name: fileItem.filename, path: fileItem.path, product_id: productId}))
            await Promise.all(filesPromise)
            
            return res.redirect(`/products/${productId}/edit`)
        } catch (error) {
            console.log('erroP2',error)
        }
        
    },
    async show(req, res) {
        const product = await LoadProductsService.load('product', {where: {
            id: req.params.id
        }})
        
        console.log('aqui', product)
        
        return res.render("products/show", {product, files: product.files})
    },
    async edit(req, res) {
        const product = await LoadProductsService.load('product', {where: {
            id: req.params.id
        }})


        //get categories
        const categories = await Category.findAll()

        //get images

        return res.render("products/edit", {product, categories, files: product.files})
    
    },
    async put(req, res) {
        
        if(req.files.length !== 0) {
            const newFilesPromise = req.files.map(files => file.create({...files, product_id: req.body.id}))
            await Promise.all(newFilesPromise)
        }

        if (req.body.removed_files) {
            //recebe como 1,2,3,
            const removed_files = req.body.removed_files.split(",") //[1,2,3,]
            const lastIndex = removed_files.length - 1
            removed_files.splice(lastIndex, 1) //[1,2,3]

            const removedFilesPromise = removed_files.map(id => file.delete(id))
            await Promise.all(removedFilesPromise)
        }

        req.body.price = req.body.price.replace(/\D/g, "")

        if (req.body.old_price != req.body.price) {
            const oldProduct = await Products.find(req.body.id)
            req.body.old_price = oldProduct.price
        }

        await Products.update(req.body.id, {
            category_id: req.body.category_id,
            name: req.body.name,
            description: req.body.description,
            old_price: req.body.old_price,
            price: req.body.price,
            quantity: req.body.quantity,
            status: req.body.status
        })

        return res.redirect(`/products/${req.body.id}`)
    },
    async delete(req, res) {
        const files = await Products.files(req.body.id)
        await Products.delete(req.body.id)
        files.map(result => {
            result.rows.map(file => {
                try {
                    fs.unlinkSync(file.path)
                } catch (err) {
                    console.log(err)
                }
            })
        })   


        return res.redirect('/products/create')
    }
}