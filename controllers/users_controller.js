const user = require('../model/users_model')
const utils = require('../utils/util')
const jwt = require('jwt-simple')
const cfg = require('../config')

module.exports.findAllUsers = (req, res) => {
    user.findAllUsers((err, data) => {
        res.status(err ? 404 : 200).json({
            error: err,
            data: data
        })
    })
}

module.exports.register = ({body: {username = null, password = null}}, res) => {
    if (utils.isEmpty(username)) {
        res.status(401).json({
            error: true,
            data: "Username is Null"
        })
    } else if (utils.isEmpty(password)) {
        res.status(401).json({
            error: true,
            data: "password is Null"
        })
    } else {
        user.register(username, password, (err, data) => {
            res.status(err ? 500 : 201).json({
                error: err,
                data: data
            })
        })
    }

}

module.exports.findUser = (req, res) => {
    user.findUser(req.params.username, (err, data) => {
        res.status(err ?
            400 :
            data ?
                202 :
                404).json({
            'error': err,
            'data': data
        });
    })
}

module.exports.login = (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    if (utils.isEmpty(username)) {
        res.status(401).json({
            error: true,
            data: "Username is Null"
        })
    } else if (utils.isEmpty(password)) {
        res.status(401).json({
            error: true,
            data: "Password is Null"
        })
    } else {
        //check cache here
        user.findUserWithCreds(username, password, (err, doc) => {
            if (err || !doc) {
                return res.status(404).json({
                    error: true,
                    data: 'User name and Password combination does not exist'
                })
            }
            var payload = {
                id: doc._id,
                username: doc.username,
                timestamp: new Date(),
                uuid: doc.uuid
            }
            var token = jwt.encode(payload, cfg.jwtSecret)
            res.status(200).json({
                error: null,
                data: token
            })
        })
    }
}

module.exports.changeUser = (req, res) => {
    if (req.body.hasOwnProperty("password")) {
        user.changePassword(req.user.username, req.body.password.old, req.body.password.new, (err, docs)=> {
            if (err || docs.nModified != 1) {
                return res.status(404).json({
                    error: true,
                    data: "Wrong Password"
                })
            } else {
                return res.status(200).json({
                    error: null,
                    data: "Successfully Changed Password"
                })
            }
        })
    } else {
        res.status(404).json({
            error: true,
            data: "No Change Requested"
        })
    }

}

module.exports.logOff = (req, res) => {
    user.logOff(req.params.username, req.user.uuid, (error, data) => {
        res.status(error ? 400 : 200).json({error, data})
    })
}

module.exports.logOffAllOtherSessions = (req, res) => {
    user.logOffAllOtherSessions(req.params.username, req.user.uuid, (error, data) => {
        res.status(error ? 400 : 200).json({error, data})
    })
}