const followModel = require('../model/follow_model')
const Response = require('../response-types')

module.exports.followUser = async (
  {body: {followUsername = null}, user = null}, res) => {
  if (followUsername) {
    try {
      const msg = await followModel.followUser(user.id, followUsername)
      return Response.OK(res, msg)
    } catch (e) {
      if (e.message === 'User doesn\'t exist') {
        return Response.Unauthorized(res, {title: e.message})
      }
      console.error(e)
      return Response.InternalServerError(res, {title: `An error occurred trying to follow ${followUsername}`})
    }
  } else {
    return Response.BadRequest(res, {title: 'followUsername parameter missing'})
  }
}

module.exports.unfollowUser = async (
  {body: {unfollowUsername = null}, user = null}, res) => {
  if (unfollowUsername) {
    try {
      await followModel.unfollowUser(user.id, unfollowUsername)
      return Response.OK(res, `You have unfollowed ${unfollowUsername}`)
    } catch (e) {
      console.error(e)
      return Response.InternalServerError(res, {title: `An error occurred trying to unfollow ${unfollowUsername}`})
    }
  } else {
    return Response.BadRequest(res, {title: 'unfollowUsername parameter missing'})
  }
}

module.exports.getAllFollowing = async ({params: {userId = null}}, res) => {
  try {
    const following = await followModel.getAllFollowing(userId)
    return Response.OK(res, following)
  } catch (e) {
    console.error(e)
    return Response.InternalServerError(res, {title: 'An error occurred retrieving users following you'})
  }
}

module.exports.getAllFollowers = ({params: {userId = null}}, res) => {
  try {
    const followers = followModel.getAllFollowers(userId)
    return Response.OK(res, followers)
  } catch (e) {
    console.error(e)
    return Response.InternalServerError(res, {title: 'An error occurred retrieving your followers'})
  }
}
