const User = require('../models/user')
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

        const userId = await User.create(req.body)

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
            await User.delete(req.body.id)

            req.session.destroy()

            return res.render("session/login", {
                success: "Conta deletada! "
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