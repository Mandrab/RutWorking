/**
 * Schema of USER document in the DB
 *
 * @author Paolo Baldini
 */

const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)

// to auto-manage password salting
const bcrypt = require('bcrypt')
// to slow down brute force attacks (inc to make it harder)
const SALT_WORK_FACTOR = 10

// define user schema
const UserSchema = mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // a.t.m., only user or admin. Not both
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
})

UserSchema.pre('save', function (next) {
    var user = this;

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) throw err

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) throw err

            // override the cleartext password with the hashed one
            user.password = hash
            next()
        })
    })
})

module.exports = mongoose.model('User', UserSchema)