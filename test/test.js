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
const user = {
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

const AddUser = async (user, callback) => {
  const res = await chai.request(server).post('/users/').send(user)
  res.should.have.status(201)
  if (callback) {
    callback()
  }
  return res.body.data.username
}

const AddInvalidUser = (user, errors, callback) => {
  chai.request(server).post('/users/').send(user).end((err, res) => {
    VerifyInvalidResponse(err, res, errors, 409, callback)
  })
}

const LoginUser = async (user, callback) => {
  const res = await chai.request(server).post('/users/login').send(user)
  VerifyValidResponse(res)
  const data = res.body.data
  if (callback) {
    return callback(data)
  }
  return data
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

const VerifyInvalidResponse = (err, res, errors, status, callback) => {
  should.exist(err)
  res.should.have.status(status)
  res.body.should.be.a('object')
  res.body.should.have.property('errors')
  res.body.errors.length.should.be.eql(errors.length)
  errors.forEach((error, i) => {
    res.body.errors[i].should.have.property('title')
    res.body.errors[i].should.have.property('title').eql(error.title)
  })
  callback()
}

describe('Users', () => {
  beforeEach((done) => {
    EmptyDatabase(done)
  })

  it('POST /users | Should create a new user', async () => {
    await AddUser(user)
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

  it('POST /users | Should not create a user with no password', (done) => {
    const invalidUser = {
      username: 'brando',
      email: 'brando1@brando.com',
      name: 'Brandon Danis'
    }

    chai.request(server).post('/users/').send(invalidUser).end((err, res) => {
      VerifyInvalidResponse(err, res, [{title: 'Password is null'}], 401, done)
    })
  })

  it(
    'POST /users | Should not create a new user with already existing username',
    (done) => {
      const invalidUser = {
        username: 'brando',
        password: 'brando',
        email: 'brando1@brando.com',
        name: 'Brandon Danis'
      }

      AddUser(user, () => {
        AddInvalidUser(invalidUser, [{title: 'Username already exists'}], done)
      })
    })

  it('POST /users | Should not create a new user with already existing email',
    (done) => {
      const invalidUser = {
        username: 'brando1',
        password: 'brando',
        email: 'brando@brando.com',
        name: 'Brandon Danis'
      }

      AddUser(user, () => {
        AddInvalidUser(invalidUser, [{title: 'Email already exists'}], done)
      })
    })

  it('GET /users/:username | Should give us the users info', async () => {
    await AddUser(user)
    const res = await chai.request(server).get(`/users/${user.username}`)
    VerifyValidResponse(res, 202)
    res.body.data.should.have.property('name')
    res.body.data.should.have.property('name').eql(`${user.name}`)
    res.body.data.should.have.property('username')
    res.body.data.should.have.property('username').eql(`${user.username}`)
    res.body.data.should.have.property('datecreated')
    res.body.data.should.have.property('description')
    res.body.data.should.have.property('posts')
    res.body.data.posts.should.be.a('array')
    res.body.data.posts.length.should.be.eql(0)
    res.body.data.should.have.property('followers')
    res.body.data.followers.should.be.a('array')
    res.body.data.followers.length.should.be.eql(0)
    res.body.data.should.have.property('following')
    res.body.data.following.should.be.a('array')
    res.body.data.following.length.should.be.eql(0)
  })

  it('POST /users/login | Should login user', async () => {
    await AddUser(user)
    const res = await chai.request(server).post('/users/login').send(user)
    VerifyValidResponse(res)
    res.body.data.should.be.a('string')
  })

  it('PUT /user/profile_picture | Should allow user to update his profile picture', async () => {
    const imageUrl = 'myimage.png'

    await AddUser(user)
    const token = await LoginUser(user)
    let res = await chai.request(server).put('/users/profile_picture').set('token', token).send({image_url: imageUrl})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql('Successfully updated your user profile')
    res = await chai.request(server).get(`/users/${user.username}`)
    VerifyValidResponse(res, 202)
    res.body.data.should.have.property('profile_picture_url')
    res.body.data.should.have.property('profile_picture_url').eql(imageUrl)
  })

  it('PUT /user/background_picture | Should allow user to update his background picture', async () => {
    const imageUrl = 'my_bg_image.png'

    await AddUser(user)
    const token = await LoginUser(user)
    let res = await chai.request(server).put('/users/background_picture').set('token', token).send({image_url: imageUrl})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql('Successfully updated your user profile')
    res = await chai.request(server).get(`/users/${user.username}`)
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
    await AddUser(user)
    const token = await LoginUser(user)
    await SubmitPost(post, token)
    const res = await chai.request(server).get('/posts')
    VerifyValidResponse(res)
    res.body.data.should.be.a('array')
    res.body.data.length.should.be.eql(1)
    res.body.data[0].should.have.property('description')
    res.body.data[0].should.have.property('description').eql(post.description)
    res.body.data[0].should.have.property('image_url')
    res.body.data[0].should.have.property('image_url').eql(post.url)
    res.body.data[0].should.have.property('username')
    res.body.data[0].should.have.property('username').eql(user.username)
    res.body.data[0].should.have.property('description')
  })

  it('POST /posts | Should not submit a new post when unauthorized', (done) => {
    AddUser(user, () => {
      LoginUser(user, () => {
        chai.request(server).post('/posts').send(post).end((err, res) => {
          VerifyInvalidResponse(err, res, [{title: 'Bad token'}], 401, done)
        })
      })
    })
  })

  it('GET /posts/id/:id | Should get a post by id', async () => {
    await AddUser(user)
    const token = await LoginUser(user)
    const postInfo = await SubmitPost(post, token)
    const res = await chai.request(server).get(`/posts/id/${postInfo.id}`)
    VerifyValidResponse(res)
    res.body.data.should.have.property('description')
    res.body.data.should.have.property('description').eql(post.description)
    res.body.data.should.have.property('image_url')
    res.body.data.should.have.property('image_url').eql(post.url)
  })

  it('DELETE /posts | Should delete newly added post', async () => {
    await AddUser(user)
    const token = await LoginUser(user)
    const postInfo = await SubmitPost(post, token)
    const res = await chai.request(server).delete('/posts/').set('token', token).send({post: postInfo.id})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql(null)
  })

  it('DELETE /posts | Should not delete post when header is not set', (done) => {
    AddUser(user, () => {
      LoginUser(user, (token) => {
        SubmitPost(post, token, (postInfo) => {
          chai.request(server).delete('/posts/').send({post: postInfo.id}).end((err, res) => {
            VerifyInvalidResponse(err, res, [{title: 'Bad token'}], 401, done)
          })
        })
      })
    })
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
    await AddUser(user)
    const secondUsername = await AddUser(user2)
    const token = await LoginUser(user)
    const res = await chai.request(server).post('/follow').set('token', token).send({followUsername: secondUsername})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql('Now Following')
  })

  it('POST /follow | User should not be able to follow a non-existent user', (done) => {
    AddUser(user, () => {
      LoginUser(user, (token) => {
        chai.request(server).post('/follow').set('token', token).send({followUsername: 'rushil'}).end((err, res) => {
          VerifyInvalidResponse(err, res, [{title: 'User doesn\'t exist'}], 401, done)
        })
      })
    })
  })

  it('POST /follow | User should be told if already following another user', async () => {
    await AddUser(user)
    const secondUsername = await AddUser(user2)
    const token = await LoginUser(user)
    await FollowUser(token, secondUsername)
    const res = await chai.request(server).post('/follow').set('token', token).send({followUsername: secondUsername})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql('Already following')
  })

  it('DELETE /follow | User should be able to unfollow a user', async () => {
    await AddUser(user)
    const secondUsername = await AddUser(user2)
    const token = await LoginUser(user)
    await FollowUser(token, secondUsername)
    const res = await chai.request(server).delete('/follow').set('token', token).send({unfollowUsername: secondUsername})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql(`You have unfollowed ${secondUsername}`)
  })

  it('DELETE /follow | User should be able to attempt to unfollow a non-existent user', async () => {
    await AddUser(user)
    const token = await LoginUser(user)
    const res = await chai.request(server).delete('/follow').set('token', token).send({unfollowUsername: 'rushil'})
    VerifyValidResponse(res)
    res.body.should.have.property('data').eql('You have unfollowed rushil')
  })

  it('GET /users/:username | Should be able to see who is following when requesting user', async () => {
    const firstUsername = await AddUser(user)
    const secondUsername = await AddUser(user2)
    const token = await LoginUser(user)
    await FollowUser(token, secondUsername)
    const res = await chai.request(server).get(`/users/${user2.username}`)
    VerifyValidResponse(res, 202)
    res.body.data.should.have.property('name')
    res.body.data.should.have.property('name').eql(`${user2.name}`)
    res.body.data.should.have.property('username')
    res.body.data.should.have.property('username').eql(`${user2.username}`)
    res.body.data.should.have.property('datecreated')
    res.body.data.should.have.property('description')
    res.body.data.should.have.property('posts')
    res.body.data.posts.should.be.a('array')
    res.body.data.posts.length.should.be.eql(0)
    res.body.data.should.have.property('followers')
    res.body.data.followers.should.be.a('array')
    res.body.data.followers.length.should.be.eql(1)
    res.body.data.followers[0].should.have.property('username')
    res.body.data.followers[0].should.have.property('username').eql(firstUsername)
    res.body.data.should.have.property('following')
    res.body.data.following.should.be.a('array')
    res.body.data.following.length.should.be.eql(0)
  })

  it('GET /users/:username | Should be able to see who the user is following', async () => {
    await AddUser(user)
    const secondUsername = await AddUser(user2)
    const token = await LoginUser(user)
    await FollowUser(token, secondUsername)
    const res = await chai.request(server).get(`/users/${user.username}`)
    VerifyValidResponse(res, 202)
    res.body.data.should.have.property('name')
    res.body.data.should.have.property('name').eql(`${user.name}`)
    res.body.data.should.have.property('username')
    res.body.data.should.have.property('username').eql(`${user.username}`)
    res.body.data.should.have.property('datecreated')
    res.body.data.should.have.property('description')
    res.body.data.should.have.property('posts')
    res.body.data.posts.should.be.a('array')
    res.body.data.posts.length.should.be.eql(0)
    res.body.data.should.have.property('followers')
    res.body.data.followers.should.be.a('array')
    res.body.data.followers.length.should.be.eql(0)
    res.body.data.should.have.property('following')
    res.body.data.following.should.be.a('array')
    res.body.data.following.length.should.be.eql(1)
    res.body.data.following[0].should.have.property('username')
    res.body.data.following[0].should.have.property('username').eql(secondUsername)
  })
})
