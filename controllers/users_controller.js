const user = require('../model/users_model')
const utils = require('../utils/util')
const jwt = require('jwt-simple')
const cfg = require('../config')

module.exports.findAllUsers = async (req, res) => {
    try {
        const users = await user.findAllUsers()
        res.status(200).json({
            error: false,
            data: users
        })
    }catch (e) {
        console.log(e);
        return res.status(500).json({error: true});
    }
}

module.exports.register = async ({body: {username = null, password = null, email = null, name = null}}, res) => {
    let errors = '';

    if (utils.isEmpty(username)) {
        errors.push('Username is null')
    }
    if (utils.isEmpty(password)) {
        errors.push('Password is null')
    }
    if (utils.isEmpty(email)) {
        errors.push('Email is null')
    }
    if (utils.isEmpty(name)) {
        errors.push('Name is null')
    }

    if (!utils.isEmpty(errors)) {
        res.status(401).json({
            error: true,
            data: errors
        })
    }
    else {
        try {
            const {id, datecreated} = await user.register(username, password, email, name)
            res.status(201).json({
                error: false,
                data: {name, username, email, datecreated, id}
            })
        }catch (e) {
            if(e.code === '23505'){
                return res.status(409).json({
                    error: true,
                    msg: `${utils.capitalize(e.detail.match(/[a-zA-Z]+(?=\))/)[0])} already exists`
                })
            }else{
                console.log(e);
                return res.status(500).json({error: true});
            }
        }
    }
}

module.exports.findUser = async ({params: {username = null}}, res) => {
    try{
        const [userInfo, postInfo = [], followersInfo = [], followingInfo = []] = await user.findUser(username)
        postInfo.map(post => {
            post.user = {
                username: user.username,
                profile_picture_url: user.profile_picture_url,
                name: user.name
            };
            return post;
        });
        userInfo.posts = postInfo
        userInfo.followers = followersInfo
        userInfo.following = followingInfo
        res.status(202).json({
            error: false,
            data: userInfo
        })
    }catch (e) {
        if(e.message === 'Expected a row, none found'){ //user not found
            return res.status(404).json({
                error: true,
                data: 'User not found'
            })
        }
        res.status(500).json({
            error: true,
            data: e
        })
    }
}

module.exports.login = async ({body: {username = null, password = null}}, res) => {
    let errors = [];

    if (utils.isEmpty(username)) {
        errors.push('Username is null')
    }
    if (utils.isEmpty(password)) {
        errors.push('Password is null')
    }

    if (!utils.isEmpty(errors)) {
        return res.status(401).json({
            error: true,
            data: errors
        });
    } else {
        try{
            const token = await user.login(username, password)
            console.log(token);
            res.status(200).json({error: false, data: token})
        } catch (e) { //TODO: better error handling
            console.log(e);
            return res.status(500).json({error: true})
        }
    }
}

module.exports.changeUser = ({body: {password = null}, user: {id = -1}}, res) => {
    if (password !== null) {
        user.changePassword(id, password.old, password.new, (err, ok) => {
            if (err) {
                return res.status(404).json({
                    error: true,
                    data: 'Wrong Password'
                })
            } else {
                return res.status(200).json({
                    error: null,
                    data: 'Successfully Changed Password'
                })
            }
        })
    } else {
        res.status(404).json({
            error: true,
            data: 'No Change Requested'
        })
    }
}

module.exports.logOff = (req, res) => {
    const logOffObservable = user.logOff(req.user.uuid);
    logOffObservable.subscribe(
        () => res.status(200).json({
            error: false,
            data: null
        }),
        err => {
            console.error(err);
            res.status(400).json({
                error: true,
                data: null
            });
        }
    );
}

module.exports.logOffAllOtherSessions = (req, res) => {
    const logOffObservable = user.logOffAllOtherSessions(req.user.id, req.user.uuid);
    logOffObservable.subscribe(
        () => res.status(200).json({
            error: false,
            data: null
        }),
        err => {
            console.error(err);
            res.status(400).json({
                error: true,
                data: null
            })
        }
    )
}

module.exports.delete = (req, res) => {
    user.comparePasswordbyID(req.user.id, req.body.password, (err, ok) => {
        if (ok) {
            const deleteUserObservable = user.delete(req.user.id);
            deleteUserObservable.subscribe(
                () => {
                    res.status(200).json({
                        error: true,
                        data: 'Successfully deleted user'
                    })
                },
                err => {
                    console.error(err);
                    res.status(500).json({
                        error: true,
                        data: null
                    })
                }
            )
        }
        else
            res.status(403).json({
                error: true,
                data: "Password Was Incorrect"
            })
    })
}

module.exports.updateProfilePicture = ({user: {id = null}, body: {image_url = null} },res) => {
    const updateProfilePictureObservable = user.updateProfilePicture(id, image_url)
    updateProfilePictureObservable.subscribe(
        () => {
            res.status(200).json({
                error: false,
                data: 'Successfully update user profile'
            })
        },
        err => {
            res.status(500).json({
                error: true,
                data: 'Failed to update user profile'
            })
        }
    )
}

module.exports.updateBackgroundPicture = ({user: {id = null}, body: {image_url = null}},res) => {
    const updateBackgroundPictureObservable = user.updateBackgroundPicture(id, image_url)
    updateBackgroundPictureObservable.subscribe(
        () => {
            res.status(200).json({
                error: false,
                data: 'Successfully update user profile'
            })
        },
        err => {
            res.status(500).json({
                error: true,
                data: 'Failed to update user profile'
            })
        }
    )
}
