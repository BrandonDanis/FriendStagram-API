const cfg = require('./config');
const jwt = require('jwt-simple');
const user = require('./model/users_model');


module.exports.authenticate = (req, res, next) => {
    var token = req.get('token')
    console.log(token);
    try {
        var {id, username, uuid} = jwt.decode(token, cfg.jwtSecret);
        console.log(id, username, uuid)
    }
    catch (e) {
        return res.status(401).json({
            error: true,
            data: 'bad token'
        })
    }
    user.authenticate(id, username, (err, docs) => {
        console.log(id, username)
        if (err || !docs) {
            return res.status(404).json({
                error: true,
                data: 'User not found'
            })
        } else if (!docs.openSessions.includes(uuid)) {
            return res.status(412).json({
                error: true,
                data: 'User not logged in'
            })
        }
        req.user = {id, username, uuid};
        next();
    })
};

module.exports.authorizedToDelete = (req, res, next) => {
    user.authorizedToDelete(req.body.post, req.user.id, (err, authorized) => {
        if(err) {
            return res.status(500).json({
                error: true,
                data: 'Database Error'
            })
        } else if (!authorized){
            return res.status(401).json({
                error: true,
                data: 'User does not have right to delete this post'
            })
        }
        next()
    })
}

