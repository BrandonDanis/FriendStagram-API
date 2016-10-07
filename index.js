const express = require('express');
const app = express();


app.get('/', function(req,res){
	res.send('hello world');
});

require('./routes/user-routes.js')(app);
require('./routes/post-routes.js')(app);

app.listen(process.env.PORT || 8080);

