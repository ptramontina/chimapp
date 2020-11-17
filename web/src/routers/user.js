const express = require('express')
const router = express.Router()

router.get('/users', async (req, res) => {
    const db = req.app.locals.db

    try {
        const users = await db.collection('users').find({}).toArray()

        res.send({ success: true, users })
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users', async (req, res) => {
    const db = req.app.locals.db

    try {
        if (!req.body.name) {
            throw new Error('Name is required')
        }

        const lastUser = await db.collection('users').find({}).sort({id: -1}).next()
        let newId = 1
        if (lastUser) {
            newId = lastUser.id + 1
        }

        const user = await db.collection('users').insertOne({
            'id': newId,
            'name': req.body.name,
            'turns': []
        })
        
        res.status(201).send({ success: true, user: user.ops[0] })
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.get('/users/:id', async (req, res) => {
    const db = req.app.locals.db

    try {
        const user = await db.collection('users').findOne({ id: parseInt(req.params.id) })

        if (!user) {
            return res.status(404).send({success: false, message: 'User not found'})
        }
       
        res.send({ success: true, user })
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.patch('/users/:id', async (req, res) => {
    const db = req.app.locals.db

    try {
        if (!req.body.name) {
            throw new Error('Name is required')
        }

        const user = await db.collection('users').findOneAndUpdate({ id: parseInt(req.params.id)}, { $set: {"name": req.body.name} })

        if (!user) {
            return res.status(404).send({success: false, message: 'User not found'})
        }
       
        res.send({ success: true, user: user.value })
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

router.delete('/users/:id', async (req, res) => {
    const db = req.app.locals.db

    try {
        let user = await db.collection('users').findOne({ id: parseInt(req.params.id) })
        
        if (!user) {
            return res.status(404).send({success: false, message: 'User not found'})
        }

        await db.collection('users').findOneAndDelete({ id: parseInt(req.params.id) })

        // let otherUsers = await db.collection('users').find({ id: {'$gte': user.id} }).toArray()
        await db.collection('users').updateMany({id: {$gte: user.id}}, {$inc: {id: -1}})
       

        res.send({ success: true, user: user })
    } catch (e) {
        res.status(400).send({ success: false, message: e.message })
    }
})

module.exports = router
