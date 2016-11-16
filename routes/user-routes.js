const mongooseUser = require('../model/users_model');
const users_controller = require('../controllers/users_controller');
const auth = require('../auth.js');

module.exports = function (app) {
    app.get('/users', users_controller.findAllUsers)
    app.post('/users', users_controller.register)
    app.get('/user/:username', users_controller.findUser)
    app.post('/login', users_controller.login);
    app.put('/user/:username', auth.authenticate, users_controller.changeUser)
    app.get('/user/:username/logOff', auth.authenticate, users_controller.logOff)
    app.get('/user/:username/logOffAllOtherSessions', auth.authenticate, users_controller.logOffAllOtherSessions)
};
