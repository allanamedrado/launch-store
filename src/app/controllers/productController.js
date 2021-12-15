const category = require('../models/category')
const product = require('../models/product')

module.exports = {
    async create(req, res) {
        //pegar categorias
        category.all().then(function(results) {
            const categories = results.rows
            return res.render("products/create.njk", {categories})
        }).catch(function(err) {
            throw new Error(err)
        })

        return res.render("products/create.njk", {categories})
    },
    async post(req, res) {
        const keys = Object.keys(req.body)

        for(key of keys) {
            if(req.body[key] == "") {
                return res.send('Please, fill all fields!')
            }
        }

        let results = await product.create(req.body) 
        const product = results.rows[0]

        results = await category.all()
        const categories = results.rows

        return res.render("products/create.njk", {product, categories})
    }
}