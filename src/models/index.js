/**
 * Groups interesting model entities
 *
 * @author Paolo Baldini
 */

module.exports = {
    mongoose: require('mongoose'),
    user: require('./user'),
    role: require('./role'),
    ROLES: ['admin', 'user']
}