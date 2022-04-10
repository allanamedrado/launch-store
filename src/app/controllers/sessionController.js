const User = require('../models/user')
const crypto = require('crypto')
const {hash} = require('bcryptjs')
const mailer = require('../../lib/mailer')

module.exports = {  
    loginForm(req, res) {
        return res.render("session/login")
    },
    login(req, res) {
        //verificar se o usuario esta cadastrado

        //verificar se o password confere

        //colocar o usuario no req.session - o que deixa ele no estado de logado

        req.session.userId = req.user.id

        return res.redirect("/users")
    },
    logout(req, res) {
        req.session.destroy()
        return res.redirect("/")
    },
    forgotForm(req, res) {
        return res.render("session/forgot-password")
    },
    async forgot(req, res) {
        const user = req.user
        //token para o usuario
        //criar uma expiração do token
        //enviar um email com um link de recuperação 
        //avisar o usuário que enviamos o email 

        try {
            const token = crypto.randomBytes(20).toString("hex")

            let now = new Date()
            now = now.setHours(now.getHours() + 1) 
            console.log(user)
    
            await User.update(user.id, {
                reset_token: token,
                reset_token_expires: now
            })
    
            await mailer.sendMail({
                to: user.email,
                from: 'no-reply@launchstore.com',
                subject: 'Recuperação de senha',
                html: `
                    <h2>Perdeu a senha?</h2>
                    <p>Não se preocupe, clique no link abaixo para recuperar sua senha!</p>
                    <p>
                        <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
                            RECUPERAR SENHA
                        </a>
                    </p>
                `
            })
            return res.render("session/forgot-password", {
                success: "Verifique seu email para recuperar sua senha"
            })
        }
        catch (error) {
            console.log(error)
            return res.render("session/forgot-password", {
                error
            })
        }
    },
    resetForm(req, res) {
        return res.render("session/password-reset", {token: req.query.token})
    },
    async reset(req, res) {
        const {  password, token } = req.body
        const user = req.user
        try {
            //validar
            //cria um novo hash de senha
            //atualiza o usuario
            //avisa o usuario que ele tem uma nova senha
            const newPassword = await hash(password, 8)

            await User.update(user.id, {
                password: newPassword,
                reset_token: "",
                reset_token_expires: ""
            })

            return res.render("session/login", {
                user: req.body,
                token,
                success: "Senha atualizada! Faça o seu login"
            })
        } catch (error) {
            console.error(error)
            return res.render("session/password-reset", {
                user: req.body,
                error
            })
        }
    }
}