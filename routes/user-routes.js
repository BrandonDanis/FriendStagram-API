const mongooseUser = require('../model/users_model');
const users_controller = require('../controllers/users_controller');
const auth = require('../auth.js');

module.exports = function (app) {
    app.get('/users', users_controller.findAllUsers)
    app.post('/users', users_controller.register)
    app.get('/user/:user_name', users_controller.findUser)
    app.post('/login', users_controller.login);
    app.put('/user/:user_name', auth.authenticate, users_controller.changeUser)
    app.get('/user/:user_name/logoff', auth.authenticate, users_controller.logOffAllOtherSessions)
};
