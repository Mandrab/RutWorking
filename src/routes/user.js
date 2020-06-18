const authJwt = require("../auths/jwt")
const controller = require("../controllers/user")

module.exports = function (app) {
    // register a new user
    app.post("/user/:userID", (request, result) => {
        controller.register(request.params.userID, request.body.password, request.body.role, result)
    })

    // get info
    app.get("/user/:userID", [authJwt.verifyToken, authJwt.userOrAdmin], function (_, result) {
        result.status(200).send('TODO')
    })

    // block user
    app.delete("/user/:userID", [authJwt.verifyToken, authJwt.userOrAdmin], function (_, result) {
        result.status(200).send('TODO')
    })
}