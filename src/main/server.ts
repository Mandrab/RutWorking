import express = require('express')
import cors = require('cors')
import { connect } from 'mongoose'
import { json } from 'body-parser'
import { config as dbConfig } from './config/db'

const setup = async () => { 
    const app = express()

    app.use(cors({ origin: "http://localhost:8081" })) // ??

    // parse requests of content-type application/json
    app.use(json())

    // connect to db
    await connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    /*await register('ADMIN_EMAIL', 'ADMIN_PASSWORD', Roles.ADMIN).catch((err: any) => {
        if (err.code !== 406) throw err
    })*/
    console.log('Successfully connected to MongoDB')

    // routes
    require('./routes/module')(app);
    require('./routes/project')(app);
    require('./routes/user')(app);

    app.use((_, result) => { result.status(404).end() })

    app.listen(8080)
}

setup()