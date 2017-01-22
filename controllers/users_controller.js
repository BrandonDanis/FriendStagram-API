const user = require('../model/users_model')
const post = require('../model/posts_model')
const utils = require('../utils/util')
const jwt = require('jwt-simple')
const cfg = require('../config')
const bcrypt = require('bcrypt')

module.exports.findAllUsers = (req, res) => {
    user.findAllUsers((err, data) => {
        res.status(err ? 404 : 200).json({
            error: err,
            data: data
        })
    })
}

module.exports.register = ({body: {username = null, password = null, email = null, name = null}}, res) => {
    var errorMessage = ""

    if (utils.isEmpty(username)) {
        errorMessage+="Username is Null\n"
    }
    if (utils.isEmpty(password)) {
        errorMessage+="Password is Null\n"
    }
    if(utils.isEmpty(email)){
        errorMessage+="Email is Null\n"
    }
    if(utils.isEmpty(name)){
        errorMessage+="Name is Null\n"
    }

    if(!utils.isEmpty(errorMessage)){
        res.status(401).json({
            error: true,
            data: errorMessage
        })
    }
    else {
        user.register(username, password, email, name, (err, data) => {
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
        })
    })
}

module.exports.login = (req, res) => {
    var username = req.body.username
    var password = req.body.password
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
        user.login(username, password, (err, doc) => {
            console.log(doc)
            if (err || !doc) {
                return res.status(404).json({
                    error: true,
                    data: 'Username and Password combination does not exist'
                })
            }
            var payload = {
                id: doc.id,
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
        user.changePassword(req.user.id, req.body.password.old, req.body.password.new, (err, docs)=> {
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
    user.logOff(req.user.id, req.user.uuid, (error, data) => {
        res.status(error ? 400 : 200).json({error, data})
    })
}

module.exports.logOffAllOtherSessions = (req, res) => {
    user.logOffAllOtherSessions(req.user.id, req.user.uuid, (error, data) => {
        res.status(error ? 400 : 200).json({error, data})
    })
}

module.exports.delete = (req, res) => {
    user.comparePasswordbyID(req.user.id, req.body.password, (err, ok) => {
        if (ok) {
            user.findUserPostsbyID(req.user.id, (error, urls) => {
                console.log(urls)
                if(error)
                    return res.status(500).json({
                        error:true,
                        data: "Database error"
                    })
                else if(urls.posts)
                    post.batchDelete(urls.posts, (error, data) => {
                        if(error)
                            return res.status(400).json({error: true, data})
                        else
                            user.delete(req.user.id, (userDeleteError, data) => {
                                if(userDeleteError)
                                    res.status(500).json({
                                        error: true,
                                        data: "Database error"
                                    })
                                else
                                    res.status(200).json({
                                        error: null,
                                        data: "Successfully deleted user"
                                    })
                            })
                    })

            })

        }
        else
            res.json({
                error: true,
                data: "Password Was Incorrect"
            })
    })
}
