/**
 * Schema of PROJECT document in the DB
 *
 * @author Paolo Baldini
 */

const mongoose = require("mongoose")
mongoose.set('useCreateIndex', true)

const ProjectSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    chief: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    modules: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module"
    } ]
})

module.exports = mongoose.model('Project', ProjectSchema)