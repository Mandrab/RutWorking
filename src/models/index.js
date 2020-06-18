const db = {
    mongoose: require('mongoose'),
    user: require('./user'),
    role: require('./role'),
    ROLES: ['admin', 'user']
}

module.exports = db