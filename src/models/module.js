/**
 * Schema of MODULE document in the DB
 *
 * @author Paolo Baldini
 */

const mongoose = require("mongoose")
mongoose.set('useCreateIndex', true)

const ModuleSchema = mongoose.Schema({
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
    developers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    chatMessages: [{
        data: Date,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        message: String
    }],
    kanbanItems: [{
        taskDescription: String,
        status: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Status"
        },
        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }]
})

module.exports = mongoose.model('Module', ModuleSchema)