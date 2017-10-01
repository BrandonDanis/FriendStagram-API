const cfg = require('./config')
const jwt = require('jwt-simple')
const user = require('./model/users_model')


module.exports.authenticate = async (req, res, next) => {
    const token = req.get('token');
    try {
        const {id, uuid} = jwt.decode(token, cfg.jwtSecret);

        try{
            await user.authenticate(id, uuid)
            req.user = {id, uuid};
            next()
        } catch (e) {
            switch (e.message) {
                case 'User not found':
                    return res.status(404).json({
                        error: true,
                        data: 'User not found'
                    });
                case 'User not logged in':
                    return res.status(412).json({
                        error: true,
                        data: 'User not logged in'
                });
            }
        }
    }
    catch (e) {
        return res.status(401).json({
            error: true,
            data: 'bad token'
        })
    }
}

module.exports.authorizedToDelete = async (req, res, next) => {
    try{
        await user.authorizedToDelete(req.body.post, req.user.id)
        next()
    } catch (e) {
        if (e.message.indexOf('Expected a row') > -1)
            res.status(401).json({
                error: true,
                data: 'User does not have right to delete this post'
            })
        else {
            res.status(500).json({
                error: true,
                data: null
            })
        }
    }
}
