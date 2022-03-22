const express = require('express')
const app = express()
const port = process.env.PORT || 8002

app.use(express.static('public'))

// app.get('/', (req, res) => {
//     res.sendFile('james.html', { root: __dirname + '/public' })
// })

// app.get('/:file', (req, res) => {
//     const { file } = req.params
//     res.sendFile(`${file}.html`, { root: __dirname + '/public' })
// })
// app.get('/', (req, res) => {
//     // res.send()
//     res.sendFile('index.html')
// })

// app.get('/:file', (req, res) => {
//     const { file } = req.params
//     res.send()
//     // res.sendFile(`${file}.html`)
// })


app.listen(port, () => console.log(`Server has started on port: ${port}`))