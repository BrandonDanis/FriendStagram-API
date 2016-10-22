const mongooseUser = require('../model/users_model.js');
const users_controller = require('../controllers/users_controller.js');

module.exports = function(app){
	app.get('/users',users_controller.findAllUsers)
	app.post('/users',users_controller.register)
	app.get('/user/:id',users_controller.findUser)
	app.post("/login",users_controller.login);
};
