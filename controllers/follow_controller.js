const followModel = require('../model/follow_model')
const {Response, Error, ErrorResponse} = require('../response-types')

module.exports.followUser = async (
  {body: {followUsername = null}, user = null}, res) => {
  if (followUsername) {
    try {
      const msg = await followModel.followUser(user.id, followUsername)
      return res.status(200).json(new Response(msg))
    } catch (e) {
      if (e.message === 'User doesn\'t exist') {
        return res.status(401).json(new ErrorResponse(
          [new Error(e.message)],
        ))
      }
      console.error(e)
      return res.status(500).json(new ErrorResponse(
        [new Error(e.message)],
      ))
    }
  } else {
    return res.status(400).json(new ErrorResponse(
      [new Error('followUsername parameter was not set')],
    ))
  }
}

module.exports.unfollowUser = async (
  {body: {unfollowUsername = null}, user = null}, res) => {
  if (unfollowUsername) {
    try {
      await followModel.unfollowUser(user.id, unfollowUsername)
      return res.status(200).json(
        new Response(`You have unfollowed ${unfollowUsername}`),
      )
    } catch (e) {
      // TODO: Do better error handling
      console.error(e)
      return res.status(500).json(new ErrorResponse(
        [new Error(`An error occurred unfollowing ${unfollowUsername}`)],
      ))
    }
  } else {
    return res.status(400).json(new ErrorResponse(
      [new Error('unfollowUsername parameter was not set')],
    ))
  }
}

module.exports.getAllFollowing = async ({params: {userId = null}}, res) => {
  try {
    const following = await followModel.getAllFollowing(userId)
    return res.status(200).json(new Response(following))
  } catch (e) {
    console.error(e)
    return res.status(500).json(new ErrorResponse(
      [new Error('An error occurred retrieving users following you')],
    ))
  }
}

module.exports.getAllFollowers = ({params: {userId = null}}, res) => {
  try {
    const followers = followModel.getAllFollowers(userId)
    return res.status(200).json(new Response(followers))
  } catch (e) {
    console.error(e)
    return res.status(500).json(new ErrorResponse(
      [new Error('An error occurred retrieving your followers')],
    ))
  }
}
