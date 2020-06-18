const express = require('express')
const bodyParser = require("body-parser");
const cors = require('cors')
const dbConfig = require('./config/db')
const db = require('./models')

var app = express()

app.use(cors({ origin: "http://localhost:8081" })) // ??

// parse requests of content-type application/json
app.use(bodyParser.json())

// connect to db
db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw err
    console.log('Successfully connected to MongoDB')
})

// routes
require('./routes/user')(app);

app.use((_, result) => { result.status(404).end() })

app.listen(8080)