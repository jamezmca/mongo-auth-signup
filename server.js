const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
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
app.post('/', async (req, res) => {
    const { token } = req.body
    console.log('main')
    console.log(token)
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET) //
        const _id = user.id
        const friendsList = await User.find({ _id })

        res.json({ status: 'success', data: friendsList[0].friends })
    } catch (err) {
        res.redirect('/login')
    }
})

app.post('/api/addFriend', async (req, res) => {
    const { friend, token } = req.body
    const user = jwt.verify(token, process.env.JWT_SECRET) //
    const _id = user.id
    const friendsList = await User.find({ _id })
    try {
        await User.updateOne({ _id }, {
            $set: { friends: [...friendsList[0].friends, friend] }
        })
        res.status(200).send({ status: 'success' })
    } catch (err) {
        res.status(400)
    }

})

app.post('/api/change-pass', async (req, res) => {
    const { token, newpassword } = req.body
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET) //
        const _id = user.id
        const hashedPassword = await bcrypt.hash(newpassword, 10)
        await User.updateOne({ _id }, {
            $set: { password: hashedPassword }
        })
        res.json({ status: 'success' })
    } catch (err) {
        res.json({ status: 'error', error: 'Invalid user' })
    }
})

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body

    const user = await User.findOne({ username }).lean()
    const secret = process.env.JWT_SECRET

    if (!username || !password) {
        return res.json({ status: 'error', error: 'Please enter username and password' })
    } //guard clause. If this passes, then we get to successful code

    if (!bcrypt.compare(password, user.password)) {
        return res.json({ status: 'error', error: 'Invalid username or password' })
    }

    //username passowrd combo is successful
    const token = jwt.sign({
        id: user._id, username: user.username
    }, process.env.JWT_SECRET)

    res.json({ status: 'ok', data: { token, username } })
})

app.post('/api/register', async (req, res) => {

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