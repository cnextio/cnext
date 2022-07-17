const express = require('express')
const app = express()
const path = require('path')

app.use(express.static('../cnext_app/out'))

app.listen(3000, () => {
    console.log('ok');
});