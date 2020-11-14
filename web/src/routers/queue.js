const express = require('express')
const moment = require('moment');
const router = express.Router()

let current = null
let lastStarted = moment()

router.post('/change-event', async (req, res) => {
    let io = req.app.locals.io
    let db = req.app.locals.db

    if (current === null) {
        let user = await db.collection('users').findOne({})
        current = user
    } else {
        await db.collection('users').updateOne(
            { _id: current._id },
            { $push: { turns: moment().diff(lastStarted) } }
        )

        let next = await db.collection('users').findOne({ id: (current.id + 1) })
        
        if (!next) {
            current = await db.collection('users').findOne()
        } else {
            current = next
        }
    }

    lastStarted = moment()

    io.emit('change-event', await getData(db));

    res.send({ sucess: true, message: 'Event sent' });
})

router.post('/pause', async (req, res) => {
    let db = req.app.local.db

    await db.collection('users').updateOne(
        { _id: current._id },
        { $push: { turns: moment().diff(lastStarted) } }
    )

    current = null;

    req.app.locals.io.emit('change-event', await getData(db));

    res.send({ sucess: true, message: 'Event sent' });
})

router.get('/get-users', async (req, res) => {
    res.send(await getData(req.app.locals.db));
})

async function getData(db) {
    return {
        users: await db.collection('users').find({}).toArray().then(array => {
            return array.map(u => {
                let average = u.turns.length > 0 ? moment.utc(weightedAverage(u.turns)).format('HH:mm:ss') : '00:00:00'
                return { id: u.id, name: u.name, average }
            })
        }), current: current !== null ? current.id : null, last_started: lastStarted
    }
}

function weightedAverage(values) {
    return values.reduce((total, value) => ((value / 1000) * value) + total, 0) / values.reduce((total, value) => (value / 1000) + total, 0)
}

function simpleAverage(values) {
    return values.length > 0 ? values.reduce((total, value) => value + total, 0) / values.length : 0
}

module.exports = router