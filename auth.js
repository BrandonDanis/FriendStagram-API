const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
var cfg = require("./config.js");

var params = {
	secretOrKey: cfg.jwtSecret,
	jwtFromRequest: ExtractJwt.fromAuthHeader()
};

module.exports = function() {
	var strategy = new JwtStrategy(params, function(payload, done) {
		console.log(payload);
		var user = users[payload.id] || null;
		if (user) {
			return done(null, {id: user.id});
		} else {
			return done(new Error("User not found"), null);
		}	
	});
	passport.use(strategy);
	return {
		initialize: function() {
			return passport.initialize();
		},
		authenticate: function() {
			console.log('we tryna authenticate');
			return passport.authenticate("jwt", cfg.jwtSession);
		}
	};
};

