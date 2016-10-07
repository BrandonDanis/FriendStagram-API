module.exports = function(app){
	app.get('/user', function(req,res){
		res.send('We in user')
	})
};
