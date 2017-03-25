const cfg = require('./config')
const jwt = require('jwt-simple')
const user = require('./model/users_model')


module.exports.authenticate = (req, res, next) => {
    const token = req.get('token');
    try {
        const {id, uuid} = jwt.decode(token, cfg.jwtSecret);
        console.log(id, uuid);
        const authObservable = user.authenticate(id, uuid);
        authObservable.subscribe(
            () => {
                req.user = {id, uuid};
                next()
            },
            err => {
                console.error(err.error);
                switch (err.table) {
                    case 'users':
                        return res.status(404).json({
                            error: true,
                            data: 'User not found'
                        });
                    case 'users_sessions':
                        return res.status(412).json({
                            error: true,
                            data: 'User not logged in'
                        });
                }
            }
        )
    }
    catch (e) {
        return res.status(401).json({
            error: true,
            data: 'bad token'
        })
    }
}

module.exports.authorizedToDelete = (req, res, next) => {
    const deleteAuthorizationObservable = user.authorizedToDelete(req.body.post, req.user.id);
    deleteAuthorizationObservable.subscribe(
        () => next(),
        err => {
            console.error(err);
            if (err.message.indexOf('Expected a row') > -1)
                res.status(401).json({
                    error: true,
                    data: 'User does not have right to delete this post'
                });
            else
                res.status(500).json({
                    error: true,
                    data: null
                });
        }
    );
    /*, (err, authorized) => {
        if (err) {
            return res.status(500).json({
                error: true,
                data: 'Database Error'
            })
        } else if (!authorized) {
            return res.status(401).json({
                error: true,
                data: 'User does not have right to delete this post'
            })
        }
        next()
    })*/
};

