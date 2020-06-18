const authJwt = require("../auths/jwt")
const controller = require("../controllers/user")

module.exports = function (app) {
    // register a new user
    app.post("/user/:userID", controller.register)

    // get info
    app.get("/user/:userID", [authJwt.userOrAdmin], controller.getUserInfo)

    // block user TODO or only admin ?
    app.delete("/user/:userID", [authJwt.userOrAdmin], controller.blockUser)
}