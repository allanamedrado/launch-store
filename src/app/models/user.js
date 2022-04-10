const db = require('../../config/db')
const { hash } = require('bcryptjs')
const Product = require('../models/product')
const fs = require('fs')

module.exports = {
    async findOne(filters) {
        let query = "SELECT * FROM users"

        Object.keys(filters).map(key => {
            //WHERE | OR
            query = `
                ${query}
                ${key}
            `

            Object.keys(filters[key]).map(field => {
                query = `
                    ${query} ${field} = '${filters[key][field]}'
                `
            })
        })

        const results = await db.query(query)

        return results.rows[0]
    },
    async create(data) {
        try {
            const query = `
                INSERT INTO users (
                    name,
                    email,
                    password,
                    cpf_cnpj,
                    cep,
                    address
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `
            //hash de senha
            const passwordHash = await hash(data.password, 8)
            //100
            const values = [
                data.name,
                data.email,
                passwordHash,
                data.cpf_cnpj.replace(/\D/g,""),
                data.cep.replace(/\D/g,""),
                data.address
            ]

            const results = await db.query(query, values)

            return results.rows[0].id
        } catch (error) {
            console.log(error)
        }
    },
    async update(id, fields) {
        let query = "UPDATE users SET"

        Object.keys(fields).map((key, index, array) => {
            if ((index + 1) < array.length) {
                query = `
                    ${query}
                    ${key} = '${fields[key]}',
                `
            } else {
                //last iteration - não precisa de virgula
                query = `
                    ${query}
                    ${key} = '${fields[key]}'
                    WHERE id = ${id}
                `
            }
        })
        

        await db.query(query)
        return;
    },
    async delete(id) {
        //pegar todos os produtos do usuario
        let results = await db.query("SELECT * FROM products WHERE user_id = $1", [id])
        const products = results.rows

        debugger
        //pegar todas as imagens
        const allFilesPromise = products.map(product => {
            Product.files(product.id)
        })

        let promiseResults = await Promise.all(allFilesPromise)

        //rodar a remoção do usuario no banco
        await db.query('DELETE FROM users WHERE id = $1', [id])
        
        //remover as imagens do sistema
        promiseResults.map(result => {
            result.rows.map(file => {
                try {
                    fs.unlinkSync(file.path)
                } catch (err) {
                    console.log(err)
                }
            })
        })
        
    }
}