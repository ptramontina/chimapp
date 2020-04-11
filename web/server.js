let express = require('express');
let moment = require('moment');
let bodyParser = require('body-parser');
let io = require('socket.io');

let app = express();
const port = 3000

// In the future, get those users from DB
let users = [
    { id: 1, name: 'Person 1' , turns: [] },
    { id: 2, name: 'Person 2' , turns: [] },
    { id: 3, name: 'Person 3' , turns: [] },
    { id: 4, name: 'Person 4' , turns: [] },
]

var current = null
var lastStarted = moment()

app.set('views', `${__dirname}/views`);
app.use('/static', express.static(__dirname + '/public'));

app.use (bodyParser.urlencoded( {extended : true} ) );

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})

app.post('/change-event', (req, res) => {
    if (current === null) {
        current = 0        
    } else {
        users[current].turns.push(moment().diff(lastStarted))

        current = current < users.length - 1 ? ++current : 0
    }

    lastStarted = moment()

    io.emit('change-event', getData());

    res.send({sucess: true, message: 'Event sent'});
})

app.post('/pause', (req, res) => {
    users[current].turns.push(moment().diff(lastStarted))

    current = null
    
    io.emit('change-event', getData());

    res.send({sucess: true, message: 'Event sent'});
})

app.get('/get-users', (req, res) => {
    res.send(getData())
})

let server = app.listen(port, () => {
    console.log("Server started at port " + port);
});

io = io.listen(server)

io.sockets.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

function getData () {
    return { users: users.map(u => {
        let average = u.turns.length > 0 ? moment.utc(weightedAverage(u.turns)).format('HH:mm:ss') : '00:00:00'
        return {id: u.id, name: u.name, average }
    }), current: current !== null ? users[current].id : null, last_started: lastStarted }
}

function weightedAverage (values) {
    return values.reduce((total, value) => ((value / 1000) * value) + total, 0) / values.reduce((total, value) => (value / 1000) + total, 0)
}

function simpleAverage (values) {
    return values.length > 0 ? values.reduce((total, value) => value + total, 0) / values.length : 0
}
