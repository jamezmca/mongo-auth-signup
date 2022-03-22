const fs = require('fs')
const express = require('express')
const app = express()
const port = process.env.PORT || 8002

app.use(express.static(__dirname + '/public')) //if no other files, will serve index.html
app.use(express.json())

app.post('/api/register', async (req, res) => {
    console.log(req.body)
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