const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const io = require('socket.io');
const path = require('path')

const app = express();
const port = 3000

const queueRouter = require('./routers/queue')
const userRouter = require('./routers/user')

MongoClient.connect('mongodb://localhost:27017/', { useUnifiedTopology: true })
.then(client =>{
  const db = client.db('chimapp-api');
  app.locals.db = db;
});

app.set('views', `${__dirname}/views`);
app.use('/static', express.static(path.join(__dirname, '../public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

app.use(queueRouter)
app.use(userRouter)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})

let server = app.listen(port, () => {
    console.log("Server started at port " + port);
});

app.locals.io = io.listen(server)

app.locals.io.sockets.on('connection', (socket) => {
    console.log('User connected');
    socket.on('disconnect', function () {
        console.log('User disconnected');
    });
});


