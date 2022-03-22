const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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
//JWT -> client proves itself on request & don't have to keep a stored state

//Routes 
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body

    const user = await User.findOne({ username }).lean()

    if (!username || !password || !await bcrypt.compare(password, user.password)) {
        return res.json({ status: 'error', error: 'Invalid username or password' })
    } //guard clause. If this passes, then we get to successful code

    //username passowrd combo is successful
    const token = jwt.sign({
        id: user._id, username: user.username
    }, process.env.JWT_SECRET)

    res.json({ status: 'ok', data: token })
})

app.post('/api/register', async (req, res) => {
    console.log(req.body)
    const { username, password } = req.body
    if (!username || !password || typeof username !== 'string') {
        return res.json({ status: 'error', error: 'Incorrectly username' }) //otherwise status and data keys
    }
    // could also implement password checking

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
        // console.log(JSON.stringify(err))
        if (err.code === 11000) {
            //key already exists
            return res.json({ status: 'error', error: 'Username already exists' })
        }
        throw err
        // res.json({ status: 'error' })
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