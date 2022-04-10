const products = require('../models/product')
const file = require('../models/file')
const { formatPrice } = require('../../lib/date')

module.exports = {
    async index(req, res) {
        try {
            let results = await products.all()

            const product = results.rows

            if(!product) return res.send("Product not found!")

            async function getImage(productId) {
                results = await products.files(productId)
                
                const files = results.rows.map(file =>  ({ ...file, path: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`}))
                
                return files[0]
            }

            const productsPromise = product.map(async product => {
                product.img = await getImage(product.id)
                product.oldPrice = formatPrice(product.old_price)
                product.price = formatPrice(product.price)
                return product
            }).filter((product, index) => index > 2 ? false : true)

            

            const lastAdded = await Promise.all(productsPromise)

            return res.render("home/index", { products: lastAdded })
        }
        catch(err) {
            console.log(err)
        }
    }
}