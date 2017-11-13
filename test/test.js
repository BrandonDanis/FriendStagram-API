require('dotenv').config()

process.env.NODE_ENV = 'test'

const db = require('pg-bricks').configure(process.env.TEST_DB_URL)
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const beforeEach = require('mocha').beforeEach

const should = chai.should()

chai.use(chaiHttp)

// mock data
const user1 = {
  username: 'brando',
  password: 'brando',
  email: 'brando@brando.com',
  name: 'Brandon Danis'
}

const user2 = {
  username: 'brando2',
  password: 'brando2',
  email: 'brando2@brando.com',
  name: 'Brandon Danis'
}

const post = {
  url: 'myurl.png',
  description: 'Test Desc',
  tags: 'Tags'
}

describe('Heartbeat', () => {
  it('Checking if server is alive', async () => {
    const res = await chai.request(server).get('/ping')
    res.should.have.status(200)
  })
})

const AddUser = async (user) => {
  const res = await chai.request(server).post('/users/').send(user)
  res.should.have.status(201)
  return res.body.data.username
}

const AddInvalidUser = async (user, errors) => {
  const res = await chai.request(server).post('/users/').send(user)
  VerifyInvalidResponse(res, errors, 409)
}

const LoginUser = async (user) => {
  const res = await chai.request(server).post('/users/login').send(user)
  VerifyValidResponse(res)
  return res.body.data
}

const EmptyDatabase = (callback) => {
  db.delete().from('users').run((err) => {
    if (err) { console.error(err) } else { callback() }
  })
}

const VerifyValidResponse = (res, status = 200) => {
  res.should.have.status(status)
  res.body.should.be.a('object')
  res.body.should.have.property('errors')
  res.body.errors.length.should.be.eql(0)
  res.body.should.have.property('data')
}

const VerifyInvalidResponse = (res, errors, status) => {
  should.exist(res)
  res.should.have.status(status)
  res.body.should.be.a('object')
  res.body.should.have.property('errors')
  res.body.errors.length.should.be.eql(errors.length)
  errors.forEach((error, i) => {
    res.body.errors[i].should.have.property('title')
    res.body.errors[i].should.have.property('title').eql(error.title)
  })
}

describe('Users', () => {
  beforeEach((done) => {
    EmptyDatabase(done)
  })

  it('POST /users | Should create a new user', async () => {
    await AddUser(user1)
  })

  it('POST /users | Should not create a user with no username', async () => {
    const invalidUser = {
      password: 'brando',
      email: 'brando1@brando.com',
      name: 'Brandon Danis'
    }

    chai.request(server).post('/users/').send(invalidUser).end((err, res) => {
      VerifyInvalidResponse(err, res, [{title: 'Username is null'}], 401, () => {})
    })
  })

  it('POST /users | Should not create a user with no password', async () => {
    const invalidUser = {
      username: 'brando',
      email: 'brando1@brando.com',
      name: 'Brandon Danis'
    }

    const res = await chai.request(server).post('/users/').send(invalidUser)
    VerifyInvalidResponse(res, [{title: 'Password is null'}], 401)
  })

  it('POST /users | Should not create a new user with already existing username', async () => {
    const invalidUser = {
      username: 'brando',
      password: 'brando',
      email: 'brando1@brando.com',
      name: 'Brandon Danis'
    }

    await AddUser(user1)
    await AddInvalidUser(invalidUser, [{title: 'Username already exists'}])
  })

  it('POST /users | Should not create a new user with already existing email', async () => {
    const invalidUser = {
      username: 'brando1',
      password: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    await AddUser(user1)
    await AddInvalidUser(invalidUser, [{title: 'Email already exists'}])
  })

  it('GET /users/:username | Should give us the users info', async () => {
    await AddUser(user1)
    const res = await chai.request(server).get(`/users/${user1.username}`)
    VerifyValidResponse(res, 202)
    const {body: {data}} = res
    data.should.have.property('name')
    data.should.have.property('name').eql(`${user1.name}`)
    data.should.have.property('username')
    data.should.have.property('username').eql(`${user1.username}`)
    data.should.have.property('datecreated')
    data.should.have.property('description')
    data.should.have.property('posts')
    data.posts.should.be.a('array')
    data.posts.length.should.be.eql(0)
    data.should.have.property('followers')
    data.followers.should.be.a('array')
    data.followers.length.should.be.eql(0)
    data.should.have.property('following')
    data.following.should.be.a('array')
    data.following.length.should.be.eql(0)
  })

  it('POST /users/login | Should login user', async () => {
    await AddUser(user1)
    const res = await chai.request(server).post('/users/login').send(user1)
    VerifyValidResponse(res)
    res.body.data.should.be.a('string')
  })

  it('PUT /user/profile_picture | Should allow user to update his profile picture', async () => {
    const imageUrl = 'myimage.png'

    await AddUser(user1)
    const token = await LoginUser(user1)
    let res = await chai.request(server).put('/users/profile_picture').set('token', token).send({image_url: imageUrl})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql('Successfully updated your user profile')
    res = await chai.request(server).get(`/users/${user1.username}`)
    VerifyValidResponse(res, 202)
    res.body.data.should.have.property('profile_picture_url')
    res.body.data.should.have.property('profile_picture_url').eql(imageUrl)
  })

  it('PUT /user/background_picture | Should allow user to update his background picture', async () => {
    const imageUrl = 'my_bg_image.png'

    await AddUser(user1)
    const token = await LoginUser(user1)
    let res = await chai.request(server).put('/users/background_picture').set('token', token).send({image_url: imageUrl})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql('Successfully updated your user profile')
    res = await chai.request(server).get(`/users/${user1.username}`)
    VerifyValidResponse(res, 202)
    res.body.data.should.have.property('profile_background_url')
    res.body.data.should.have.property('profile_background_url').eql(imageUrl)
  })
})

const SubmitPost = async (post, token, callback) => {
  const res = await chai.request(server).post('/posts').set('token', token).send(post)
  VerifyValidResponse(res)
  const data = res.body.data
  if (callback) {
    return callback(data)
  }
  return data
}
describe('Posts', () => {
  beforeEach((done) => {
    EmptyDatabase(() => {
      done()
    })
  })

  it('GET /posts | Should return empty list of posts', async () => {
    const res = await chai.request(server).get('/posts')
    VerifyValidResponse(res)
    res.body.data.should.be.a('array')
    res.body.data.length.should.be.eql(0)
  })

  it('POST /posts | Should submit a new post', async () => {
    await AddUser(user1)
    const token = await LoginUser(user1)
    await SubmitPost(post, token)
    const res = await chai.request(server).get('/posts')
    VerifyValidResponse(res)
    const {body: {data}} = res
    data.should.be.a('array')
    data.length.should.be.eql(1)
    data[0].should.have.property('description')
    data[0].should.have.property('description').eql(post.description)
    data[0].should.have.property('image_url')
    data[0].should.have.property('image_url').eql(post.url)
    data[0].should.have.property('username')
    data[0].should.have.property('username').eql(user1.username)
    data[0].should.have.property('description')
  })

  it('POST /posts | Should not submit a new post when unauthorized', async () => {
    await AddUser(user1)
    await LoginUser(user1)
    const res = await chai.request(server).post('/posts').send(post)
    VerifyInvalidResponse(res, [{title: 'Bad token'}], 401)
  })

  it('GET /posts/id/:id | Should get a post by id', async () => {
    await AddUser(user1)
    const token = await LoginUser(user1)
    const postInfo = await SubmitPost(post, token)
    const res = await chai.request(server).get(`/posts/id/${postInfo.id}`)
    VerifyValidResponse(res)
    res.body.data.should.have.property('description')
    res.body.data.should.have.property('description').eql(post.description)
    res.body.data.should.have.property('image_url')
    res.body.data.should.have.property('image_url').eql(post.url)
  })

  it('POST /posts/like/:id | Should like a post by id', async () => {
    await AddUser(user1)
    await AddUser(user2)
    const token = await LoginUser(user1)
    const token2 = await LoginUser(user2)
    const postInfo = await SubmitPost(post, token)
    const res = await chai.request(server).post(`/posts/like/${postInfo.id}`).set('token', token2).send({id: postInfo.id})
    VerifyValidResponse(res)
  })

  it('DELETE /posts | Should delete newly added post', async () => {
    await AddUser(user1)
    const token = await LoginUser(user1)
    const postInfo = await SubmitPost(post, token)
    const res = await chai.request(server).delete('/posts/').set('token', token).send({post: postInfo.id})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql(null)
  })

  it('DELETE /posts | Should not delete post when header is not set', async () => {
    await AddUser(user1)
    const token = await LoginUser(user1)
    const postInfo = await SubmitPost(post, token)
    const res = await chai.request(server).delete('/posts/').send({post: postInfo.id})
    VerifyInvalidResponse(res, [{title: 'Bad token'}], 401)
  })
})

const FollowUser = async (token, userIdToFollow) => {
  const res = await chai.request(server).post('/follow').set('token', token).send({followUsername: userIdToFollow})
  VerifyValidResponse(res)
  res.body.should.have.property('data').eql('Now Following')
}
describe('Follow', () => {
  beforeEach((done) => {
    EmptyDatabase(() => {
      done()
    })
  })

  it('GET /follow/getAllFollowing/:userId | Should return empty list of following', async () => {
    const res = await chai.request(server).get('/follow/getAllFollowing/1')
    VerifyValidResponse(res)
    res.body.data.should.be.a('array')
    res.body.data.length.should.be.eql(0)
  })

  it('GET /follow/getAllFollowers/:userId | Should return empty list of followers', async () => {
    const res = await chai.request(server).get('/follow/getAllFollowing/1')
    VerifyValidResponse(res)
    res.body.data.should.be.a('array')
    res.body.data.length.should.be.eql(0)
  })

  it('POST /follow | User should be following User2', async () => {
    await AddUser(user1)
    const secondUsername = await AddUser(user2)
    const token = await LoginUser(user1)
    const res = await chai.request(server).post('/follow').set('token', token).send({followUsername: secondUsername})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql('Now Following')
  })

  it('POST /follow | User should not be able to follow a non-existent user', async () => {
    await AddUser(user1)
    const token = await LoginUser(user1)
    const res = await chai.request(server).post('/follow').set('token', token).send({followUsername: 'rushil'})
    VerifyInvalidResponse(res, [{title: 'User doesn\'t exist'}], 401)
  })

  it('POST /follow | User should be told if already following another user', async () => {
    await AddUser(user1)
    const secondUsername = await AddUser(user2)
    const token = await LoginUser(user1)
    await FollowUser(token, secondUsername)
    const res = await chai.request(server).post('/follow').set('token', token).send({followUsername: secondUsername})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql('Already following')
  })

  it('DELETE /follow | User should be able to unfollow a user', async () => {
    await AddUser(user1)
    const secondUsername = await AddUser(user2)
    const token = await LoginUser(user1)
    await FollowUser(token, secondUsername)
    const res = await chai.request(server).delete('/follow').set('token', token).send({unfollowUsername: secondUsername})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql(`You have unfollowed ${secondUsername}`)
  })

  it('DELETE /follow | User should be able to attempt to unfollow a non-existent user', async () => {
    await AddUser(user1)
    const token = await LoginUser(user1)
    const res = await chai.request(server).delete('/follow').set('token', token).send({unfollowUsername: 'rushil'})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql('You have unfollowed rushil')
  })

  it('GET /users/:username | Should be able to see who is following when requesting user', async () => {
    const firstUsername = await AddUser(user1)
    const secondUsername = await AddUser(user2)
    const token = await LoginUser(user1)
    await FollowUser(token, secondUsername)
    const res = await chai.request(server).get(`/users/${user2.username}`)
    VerifyValidResponse(res, 202)
    const {body: {data}} = res
    data.should.have.property('name')
    data.should.have.property('name').eql(`${user2.name}`)
    data.should.have.property('username')
    data.should.have.property('username').eql(`${user2.username}`)
    data.should.have.property('datecreated')
    data.should.have.property('description')
    data.should.have.property('posts')
    data.posts.should.be.a('array')
    data.posts.length.should.be.eql(0)
    data.should.have.property('followers')
    data.followers.should.be.a('array')
    data.followers.length.should.be.eql(1)
    data.followers[0].should.have.property('username')
    data.followers[0].should.have.property('username').eql(firstUsername)
    data.should.have.property('following')
    data.following.should.be.a('array')
    data.following.length.should.be.eql(0)
  })

  it('GET /users/:username | Should be able to see who the user is following', async () => {
    await AddUser(user1)
    const secondUsername = await AddUser(user2)
    const token = await LoginUser(user1)
    await FollowUser(token, secondUsername)
    const res = await chai.request(server).get(`/users/${user1.username}`)
    VerifyValidResponse(res, 202)
    const {body: {data}} = res
    data.should.have.property('name')
    data.should.have.property('name').eql(`${user1.name}`)
    data.should.have.property('username')
    data.should.have.property('username').eql(`${user1.username}`)
    data.should.have.property('datecreated')
    data.should.have.property('description')
    data.should.have.property('posts')
    data.posts.should.be.a('array')
    data.posts.length.should.be.eql(0)
    data.should.have.property('followers')
    data.followers.should.be.a('array')
    data.followers.length.should.be.eql(0)
    data.should.have.property('following')
    data.following.should.be.a('array')
    data.following.length.should.be.eql(1)
    data.following[0].should.have.property('username')
    data.following[0].should.have.property('username').eql(secondUsername)
  })
})
