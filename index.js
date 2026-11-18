const express = require('express');
const bbdcRouter = require('./router/bbdc')
const { Error404 } = require('./error_pages')
const app = express();
app.use(bbdcRouter)
app.use('/', (req, res) => {
    res.status(404).send(new Error404().render())
})

app.use((err, req, res, next) => {
    console.error(err)
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).json({ error: 'Internal server error' })
})

if (require.main === module) {
    app.listen(process.env.PORT || 8000)
}

module.exports = app
