const utils = require('../utils/util')
const followModel = require('../model/follow_model')
const {Response, FSError} = require('../response-types')

module.exports.followUser = async ({body, user = null}, res, next) => {
  const {followUsername = null} = body

  const errors = utils.getMissingKeys(body, ['followUsername'])
  if (!errors.isEmpty()) {
    return next(FSError.missingParameters({errors}))
  }

  try {
    const msg = await followModel.followUser(user.id, followUsername)
    return Response.OK(res, msg)
  } catch (e) {
    next(e)
  }
}

module.exports.unfollowUser = async ({body, user = null}, res, next) => {
  const {unfollowUsername = null} = body

  const errors = utils.getMissingKeys(body, ['unfollowUsername'])
  if (!errors.isEmpty()) {
    return next(FSError.missingParameters({errors}))
  }

  try {
    await followModel.unfollowUser(user.id, unfollowUsername)
    return Response.OK(res, `You have unfollowed ${unfollowUsername}`)
  } catch (e) {
    next(e)
  }
}

module.exports.getAllFollowing = async ({params: {userId = null}}, res, next) => {
  try {
    const following = await followModel.getAllFollowing(userId)
    return Response.OK(res, following)
  } catch (e) {
    next(e)
  }
}

module.exports.getAllFollowers = ({params: {userId = null}}, res, next) => {
  try {
    const followers = followModel.getAllFollowers(userId)
    return Response.OK(res, followers)
  } catch (e) {
    next(e)
  }
}
