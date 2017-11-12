const userModel = require('../model/users_model')
const utils = require('../utils/util')
const jwt = require('jwt-simple')
const cfg = require('../config')
const Response = require('../response-types')

module.exports.findAllUsers = async (req, res) => {
  try {
    const users = await userModel.findAllUsers()
    return Response.OK(res, users)
  } catch (e) {
    console.log(e)
    return Response.InternalServerError(res, {title: 'Failed to load users'})
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

  if (!errors.isEmpty()) {
    return Response.BadRequest(res, {title: errors.join(', ')})
  }
  try {
    const {id, datecreated} = await userModel.register(username, password,
      email, name)
    return Response.Created(res, {
      name, username, email, datecreated, id
    })
  } catch (e) {
    if (e.code === '23505') {
      return Response.Conflict(res, {title: `${utils.capitalize(e.detail.match(/[a-zA-Z]+(?=\))/)[0])} already exists`})
    }
    console.log(e)
    return Response.InternalServerError(res, {title: 'An error occurred trying to register'})
  }
}

module.exports.findUser = async ({params: {username = null}}, res) => {
  try {
    const [userInfo, postInfo = [], followersInfo = [], followingInfo = []] = await userModel.findUser(
      username)
    userInfo.posts = postInfo.map((post) => {
      const newPost = post
      newPost.url = post.image_url
      newPost.user = {
        username: userInfo.username,
        profile_picture_url: userInfo.profile_picture_url,
        name: userInfo.name
      }
      return newPost
    })
    userInfo.followers = followersInfo
    userInfo.following = followingInfo
    return Response.Accepted(res, userInfo)
  } catch (e) {
    if (e.message === 'Expected a row, none found') { // user not found
      return Response.NotFound(res, {title: 'User not found'})
    }
    console.error(e)
    return Response.InternalServerError(res, {title: `An error occurred trying to locate ${username}`})
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

  if (!errors.isEmpty()) {
    return Response.BadRequest(res, {title: errors.join(', ')})
  }
  try {
    const loginData = await userModel.login(username, password)
    const payload = {
      id: loginData.user_id,
      timestamp: new Date(),
      uuid: loginData.id
    }
    const token = jwt.encode(payload, cfg.jwtSecret)
    return Response.OK(res, token)
  } catch (e) {
    let error = ''
    if (e.message === 'Require key') {
      error = 'Invalid signature'
      console.error('jwtSecret is missing')
    } else {
      console.error(e)
      error = 'An error occurred trying to verify you'
    }
    return Response.InternalServerError(res, {title: error})
  }
}

module.exports.changeUser = async ({user: {id}, body: {old_password: oldPassword, new_password: newPassword}}, res) => {
  let errors = []
  if (!id) {
    errors.push('Invalid user ID')
  }
  if (!oldPassword || !newPassword) {
    errors.push('Invalid password sent')
  }
  if (!errors.isEmpty()) {
    errors = errors.map(error => new Error(error))
    return Response.BadRequest(res, errors)
  }

  try {
    await userModel.changePassword(id, oldPassword, newPassword)
    return Response.OK(res, {title: 'Successfully updated user'})
  } catch (e) {
    if (e.message !== 'Invalid password') {
      return Response.InternalServerError(res, {title: 'An error occurred trying to apply the new changes'})
    }
    return Response.Forbidden(res, {title: e.message})
  }
}

module.exports.logOff = async (req, res) => {
  try {
    await userModel.logOff(req.user.uuid)
    return Response.OK(res, 'Successfully logged out')
  } catch (e) {
    console.error(e)
    return Response.InternalServerError(res, {title: 'Failed to log out'})
  }
}

module.exports.logOffAllOtherSessions = async (req, res) => {
  try {
    await userModel.logOffAllOtherSessions(req.user.id, req.user.uuid)
    return Response.OK(res, 'Successfully logged out of your other sessions')
  } catch (e) {
    console.error(e)
    return Response.InternalServerError(res, {title: 'An error occurred logging out of your other sessions'})
  }
}

module.exports.delete = async ({body: {password = null}, user = null}, res) => {
  const passwordMatch = await userModel.comparePasswordByID(user.id, password)
  if (!passwordMatch) {
    return Response.Forbidden(res, {title: 'Invalid password'})
  }

  try {
    await userModel.delete(user.id)
    return Response.OK(res, 'Successfully deleted user')
  } catch (e) {
    console.error(e)
    return Response.InternalServerError(res, {title: 'An error occurred trying to remove your account'})
  }
}

module.exports.updateProfilePicture = async ({user: {id = null}, body: {image_url: imageURL = null}}, res) => {
  try {
    await userModel.updateProfilePicture(id, imageURL)
    return Response.OK(res, 'Successfully updated your user profile')
  } catch (e) {
    console.error(e)
    return Response.InternalServerError(res, {title: 'Failed to update user profile'})
  }
}

module.exports.updateBackgroundPicture = async ({user: {id = null}, body: {image_url: imageURL = null}}, res) => {
  try {
    await userModel.updateBackgroundPicture(id, imageURL)
    return Response.OK(res, 'Successfully updated your user profile')
  } catch (e) {
    console.error(e)
    return Response.InternalServerError(res, {title: 'Failed to update user profile'})
  }
}
