const cfg = require('./config');
const jwt = require('jwt-simple');
const user = require('./model/users_model');


module.exports.authenticate = (req, res, next) => {
	token = req.query.token;
	try{
		var {id, user_name} = jwt.decode(token, cfg.jwtSecret);
	}
	catch(e){
		return res.status(401).json({
			error: true,
			data: 'bad token'
		})
	}
	user.authenticate(id, user_name, (err, docs) => {
		if(err || !docs){
			return res.status(404).json({
				error: true,
				data: 'User not found'
			})
		} else if (!docs.logged_in){
			return res.status(412).json({
				error:true,
				data: 'User not logged in'
			})
		}
		req.user = {id, user_name};
		next();
	})

};

