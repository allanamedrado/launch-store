const { hash } = require('bcryptjs')
const User = require('../models/user')
const Product = require('../models/product')
const fs = require('fs')
const {formatCep, formatCpfCnpj } = require('../../lib/date')


module.exports = {
    registerForm(req, res) {
        return res.render("user/register")
    },
    async show(req, res) {
        const { user } = req

        user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)
        user.cep = formatCep(user.cep)
        
        return res.render("user/index", { user })
    },
    async post(req, res) {
        let { name, email, password, cpf_cnpj, cep, address } = req.body

        password = await hash(password, 8)
        cpf_cnpj = cpf_cnpj.replace(/\D/g,""),
        cep = cep.replace(/\D/g,"")

        const userId = await User.create({
            name,
            email,
            password,
            cpf_cnpj,
            cep,
            address
        })

        req.session.userId = userId //no req fica disponivel o session

        return res.redirect('/users')       
    },
    async update(req, res) {
       try {
        const { user } = req
        let { name, email, cpf_cnpj, cep, address } = req.body

        cpf_cnpj = cpf_cnpj.replace(/\D/g, "")
        cep = cep.replace(/\D/g, "")

        await User.update(user.id, {
            name,
            email,
            cpf_cnpj,
            cep,
             address
        }) //nesse caso não atualiza senha

        return res.render("user/index", {
            user: req.body,
            success: "Conta atualizada com sucesso!"
        })

       } catch (error) {
           console.log(error)
           return res.render("user/index", {
               error
           })
       }
    },
    async delete(req, res) {
        try {
            //pegar todos os produtos do usuario
            const products = await Product.findAll({
                where: {user_id: req.body.id}
            })

            //pegar todas as imagens
            const allFilesPromise = products.map(product => {
                Product.files(product.id)
            })

            let promiseResults = await Promise.all(allFilesPromise)

        //rodar a remoção do usuario no banco
            await User.delete(req.body.id)
            req.session.destroy()
        
        //remover as imagens do sistema
            promiseResults.map(result => {
                result.map(file => {
                    try {
                        fs.unlinkSync(file.path)
                    } catch (err) {
                        console.log(err)
                    }
                })
            })        

            return res.render("session/login", {
                success: "Conta deletada!"
            })
        } catch (error) {
            console.log(error)
            return res.render("user/index", {
                user: req.body,
                error
            })
        }
    }
}