const fs = require('fs')
const bcrypt = require('bcrypt')
const express = require('express')
const app = express()
const port = process.env.PORT || 8002

const mongoose = require('mongoose')
const User = require('./model/user')
mongoose.connect('mongodb://127.0.0.1:27017/login-demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})


//Middlewares
app.use(express.static(__dirname + '/public')) //if no other files, will serve index.html
app.use(express.json())

//Routes 
app.post('/api/register', async (req, res) => {
    console.log(req.body)
    const { username, password } = req.body

    //Hashing the passwords
    const encryptedPass = await bcrypt.hash(password, 10)

    try {
        const response = await User.create({
            username,
            password: encryptedPass
        })
        console.log('successfully created user', response)
        res.status(200).json({ status: 'success' })

    } catch (err) {
        res.json({ status: 'error' })
    }
})

app.get('/:file', async (req, res) => {
    const { file } = req.params
    try {
        return fs.existsSync(`./public/${file}.html`) ?
            res.sendFile(`${file}.html`, { root: __dirname + '/public' }) :
            res.send('<a href="/">Page not found | Return home</a>')
    } catch (err) {
        console.log(err)
        res.send('<a href="/">Page not found | Return home</a>')
    }
})


app.listen(port, () => console.log(`Server has started on port: ${port}`))