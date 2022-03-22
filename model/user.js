const mongoose = require('mongoose')

const userSchema = new mongoose.userSchema({
    username: { type: String, required: true }
})