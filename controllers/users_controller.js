const user = require('../model/users_model');
const utils = require('../utils/util');
const jwt = require('jwt-simple');
const cfg = require('../config');

module.exports.findAllUsers = (req,res) => {
    user.findAllUsers((err, data) =>{
        res.status(err?404:200).json({
            error: err,
            data: data
        });
    });
}

module.exports.register = ({body: {user_name = null, password = null}}, res) => {
    if(utils.isEmpty(user_name))
        res.status(401).json({
            error: null,
            data: "Username is Null"
        });
    else if(utils.isEmpty(password))
        res.status(401).json({
            error: null,
            data: "password is Null"
        });
    else
    {
        user.register(user_name,password, (err, data) => {
            res.status(err?500:201).json({
                error: err,
                data: data
            });
        })
    }

}

module.exports.findUser = (req,res) => {
    user.findUser(req.params.user_name,(err, data) => {
        res.status(err ?
            400 :
            data ?
                202 :
                404).json({'error':err, 'data': data});
    });
}

module.exports.login = (req,res) => {
    var username = req.body.user_name;
    var password = req.body.password;
    if(utils.isEmpty(username))
        res.status(401).json({
            error: null,
            data: "Username is Null"
        });
    else if(utils.isEmpty(password))
        res.status(401).json({
            error: null,
            data: "Password is Null"
        });
    else
    {
        //check cache here
        user.findUserWithCreds(username,password,(err, doc) => {
            if (err || !doc)
                return res.status(404).json({
                    error: null,
                    data: 'User name and Password combination does not exist'
                });
            var payload = {
                id: doc._id,
                user_name: doc.user_name,
                timestamp: new Date()
            };
            var token = jwt.encode(payload, cfg.jwtSecret);
            res.status(200).json({token});
        });
    }
}

module.exports.changeUser = (req,res) => {
    if(req.body.hasOwnProperty("password")){
        user.changePassword(req.user.user_name,req.body.password.old,req.body.password.new,(err,docs)=>{
            if(err || docs.nModified != 1)
                return res.status(404).json("Wrong Password");
            else
                return res.status(200).json("Successfully Changed Password");
        })
    }
    else{
        res.status(404).json("No Change Requested");
    }

}

module.exports.globalLogOff = (req,res) => {
    user.globalLogOff((err,ok) => {
        res.status(err?400:200).json({err,ok});
    })
}