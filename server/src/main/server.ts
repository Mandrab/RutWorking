import express = require('express')
import cors = require('cors')
import { connect } from 'mongoose'
import { json } from 'body-parser'
import { config as dbConfig } from './config/db'
import { register } from './models/utils/users'
import { Roles } from './models'
import { DBRole } from './models/db'

const setup = async () => { 
    const app = express()

    // allow cross-origin resource sharing only with client (8081)
    app.use(cors({ origin: ["http://localhost:8081", "http://localhost:5000"] }))

    // parse requests of content-type application/json
    app.use(json())

    // connect to db
    await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    // register default admin
    try { await register('x', 'y', 'admin@email.com', 'ADMIN_PASSWORD', Roles.USER) } catch(_) { }

    // insert default roles (if they do not exist)
    try {
        await new DBRole({ name: Roles.ADMIN }).save()
        await new DBRole({ name: Roles.USER }).save()
    } catch(_) { }
    console.log('Successfully connected to MongoDB')

    // routes
    require('./routes/notifications')(app)
    require('./routes/chat')(app)
    require('./routes/kanban')(app)
    require('./routes/module')(app)
    require('./routes/project')(app)
    require('./routes/user')(app)
    require('./routes/contest')(app)

    app.use((_, result) => { result.status(404).end() })

    app.listen(8080)
}

setup()