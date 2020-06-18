const mongoose = require("mongoose")
mongoose.set('useCreateIndex', true)

const RoleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('Role', RoleSchema)