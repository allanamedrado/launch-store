const User = require('../models/user')
const { compare } = require('bcryptjs')

async function login(req, res, next) {

   //check if user exists   

    const { password, email } = req.body

    const user = await User.findOne({where: {email}})

    if(!user) return res.render("session/login", {
        user: req.body,
        error: "Usuario não cadastrado"
    })

    const passed = await compare(password, user.password)

    if(!passed) return res.render("session/login", {
        user: req.body,
        error: "Senha incorreta"
    })

    req.user = user;

    next()
}

async function forgot(req, res, next) {
    const { email } = req.body

    try {
        let user = await User.findOne({where: {email}})

        if(!user) return res.render("session/forgot-password", {
            user: req.body,
            error: "Email não cadastrado"
        })

        req.user = user
        
        next()
    
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    login,
    forgot
}