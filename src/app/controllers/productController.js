const category = require('../models/category')
const products = require('../models/product')
const file = require('../models/file')
const { formatPrice, date } = require('../../lib/date')

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
        

        for(let key of keys) {
            if(req.body[key] == "") {
                return res.send('Please, fill all fields!')
            }
        }

        if (req.files.length === 0) {
            return res.send("Please, send at least one image")
        } 

        req.body.user_id = req.session.userId
        let results = await products.create(req.body) 

        const productId = results.rows[0].id

        const filesPromise = req.files.map(fileItem => file.create({ ...fileItem, product_id: productId}))
        await Promise.all(filesPromise).catch(error => {console.log(error)})
        
        return res.redirect(`/products/${productId}/edit`)
    },
    async show(req, res) {
        let results = await products.find(req.params.id)
        const product = results.rows[0]

        if (!product) return res.send("Product not found!")

        const { day, hour, minutes, month } = date(product.updated_at)

        
        product.published = {
            day: `${day}/${month}`,
            hour: `${hour}h${minutes}`,
        }
        
        product.oldPrice = formatPrice(product.old_price)
        product.price = formatPrice(product.price)
      
         
        results = await products.files(product.id)
        const files = results.rows.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }))

        console.log(files)

        
        return res.render("products/show", {product, files})
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
            src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
        }))

        return res.render("products/edit.njk", {product, categories, files})
    
    },
    async put(req, res) {
        const keys = Object.keys(req.body)

        for(let key of keys) {
            if(req.body[key] == "" && key != "removed_files") {
                return res.send('Please, fill all fields!')
            }
        }

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
            const oldProduct = await products.find(req.body.id)
            req.body.old_price = oldProduct.rows[0].price
        }

        await products.update(req.body)

        return res.redirect(`/products/${req.body.id}`)
    },
    async delete(req, res) {
        await products.delete(req.body.id)

        return res.redirect('/products/create')
    }
}