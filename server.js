<<<<<<< HEAD
var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
=======
const path = require('path')

const express = require('express')
const app = express()
const port = process.env.PORT || 8000

const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')

app.use(cors())
app.use(bodyParser.json())
app.use(morgan('dev'))


app.use((req, res) => {
    const status = 404
    const message = `${req.method} route for ${req.path} not found.`
    res.status(status).json({ status, message })
})

app.use((err, _req, res, _next) => {
    console.error(err)
    const status = err.status || 500
    const message = err.message || 'Something went wrong!'
    res.status(status).json({ message, status })
})

app.listen(port, () => {
    console.log('listening on port', port)
})
>>>>>>> 996d75f84a751f392c161b7b439ac189a0b6a497
