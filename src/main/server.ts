import express = require('express')
import cors = require('cors')
import { connect } from 'mongoose'
import { json } from 'body-parser'
import { config as dbConfig } from './config/db'

const app = express()

app.use(cors({ origin: "http://localhost:8081" })) // ??

// parse requests of content-type application/json
app.use(json())

// connect to db
connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

console.log('Successfully connected to MongoDB')

// routes
require('./routes/project')(app);
require('./routes/user')(app);

app.use((_, result) => { result.status(404).end() })

app.listen(8080)