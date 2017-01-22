const mongooseUser = require('../model/users_model')
const usersController = require('../controllers/users_controller')
const auth = require('../auth.js')

module.exports = function (app) {
    app.get('/users', usersController.findAllUsers)
    app.post('/users', usersController.register)
    app.get('/user/:username', usersController.findUser)
    app.post('/login', usersController.login)
    app.put('/user/:username', auth.authenticate, usersController.changeUser)
    app.get('/logOff', auth.authenticate, usersController.logOff)
    app.get('/logOffAllOtherSessions', auth.authenticate, usersController.logOffAllOtherSessions)
    app.delete('/users' , auth.authenticate, usersController.delete)
}
