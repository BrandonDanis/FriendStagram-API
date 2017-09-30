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
        console.log(e)
        return res.status(500).json({error: true})
    }
}

module.exports.register = async ({body: {username = null, password = null, email = null, name = null}}, res) => {
    let errors = []

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
                console.log(e)
                return res.status(500).json({error: true})
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
            }
            return post
        })
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
    let errors = []

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
        })
    } else {
        try{
            const loginData = await user.login(username, password)
            const payload = {
                 id: loginData.user_id,
                 timestamp: new Date(),
                 uuid: loginData.id
            }
            const token = jwt.encode(payload, cfg.jwtSecret)
            res.status(200).json({error: false, data: token})
        } catch (e) { //TODO: better error handling
            console.log(e)
            return res.status(500).json({error: true})
        }
    }
}

module.exports.changeUser = async ({user: {id}, body: {old_password, new_password}}, res) => {
    if(!id || !old_password || !new_password) //TODO: this is not very elegant and informative
        return res.status(400).json({error: true, reason: 'Improper params'})

    try {
        const updataeUser = await user.changePassword(id, old_password, new_password)
        res.status(200).send('Updated')
    } catch(e) {
        if(e.message === 'Invalid password')
            return res.status(403).json({error: true, reason: e.message})
        res.status(500).send(e.message)
    }
}

module.exports.logOff = async (req, res) => {
    try{
        await user.logOff(req.user.uuid)
        return res.status(200).json({error: false, data: null})
    } catch (e) { console.error(e) }

    res.status(500).json({
        error: true,
        data: null,
        errors: [{
            'info': 'Failed to logout'
        }]
    })
}

module.exports.logOffAllOtherSessions = async (req, res) => {
    try{
        await user.logOffAllOtherSessions(req.user.id, req.user.uuid)
    } catch(e) {
        return res.status(200).json({
            error: false,
            data: null
        })
    }

    res.status(400).json({
        error: true,
        data: null
    })
}

module.exports.delete = async (req, res) => {
    const passwordMatch = await user.comparePasswordbyID(req.user.id, req.body.password)
    if(!passwordMatch)
        throw new Error('Invalid password')

    try{
        await user.delete(req.user.id)
        return res.status(200).json({
            error: true,
            data: 'Successfully deleted user'
        })
    } catch (e) {
        res.status(500).json({
            error: true,
            data: null
        })
    }
}

module.exports.updateProfilePicture = async ({user: {id = null}, body: {image_url = null} },res) => {
    try{
        await user.updateProfilePicture(id, image_url)
    } catch (e) {
        return res.status(500).json({
            error: true,
            data: 'Failed to update user profile'
        })
    }
    res.status(200).json({
        error: false,
        data: 'Successfully update user profile'
    })
}

module.exports.updateBackgroundPicture = async ({user: {id = null}, body: {image_url = null}},res) => {
    try {
        await user.updateBackgroundPicture(id, image_url)
    } catch (e) {
        return res.status(500).json({
            error: true,
            data: 'Failed to update user profile'
        })
    }
    res.status(200).json({
        error: false,
        data: 'Successfully update user profile'
    })
}
