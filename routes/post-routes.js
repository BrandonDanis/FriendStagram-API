module.exports = function(app){
	app.get('/post', function(req,res){
		res.send('We in posts')
	})
};
