require('dotenv').config()

process.env.NODE_ENV = 'test'

const db = require('pg-bricks').configure(process.env.TEST_DB_URL)
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const beforeEach = require('mocha').beforeEach

const should = chai.should()

chai.use(chaiHttp)

describe('Heartbeat', () => {
  it('Checking if server is alive', (done) => {
    chai.request(server).get('/ping').end((err, res) => {
      should.not.exist(err)
      res.should.have.status(200)
      done()
    })
  })
})

const AddUser = (user, callback) => {
  chai.request(server).post('/users/').send(user).end((err, res) => {
    should.not.exist(err)
    res.should.have.status(201)
    res.body.should.be.a('object')
    res.body.should.have.property('errors')
    res.body.errors.should.have.property('length').eql(0)
    res.body.should.have.property('data')
    callback(res.body.data.username)
  })
}
const AddInvalidUser = (user, callback) => {
  chai.request(server).post('/users/').send(user).end((err, res) => {
    should.exist(err)
    res.should.have.status(409)
    res.body.should.be.a('object')
    res.body.should.have.property('errors')
    res.body.errors.length.should.be.eql(1)
    callback()
  })
}
const LoginUser = (user, callback) => {
  chai.request(server).post('/users/login').send(user).end((err, res) => {
    should.not.exist(err)
    res.should.have.status(200)
    res.body.should.be.a('object')
    res.body.should.have.property('errors')
    res.body.errors.length.should.be.eql(0)
    res.body.should.have.property('data')
    callback(res.body.data)
  })
}
const EmptyDatabase = (callback) => {
  db.delete().from('users').run((err) => {
    if (err) { console.error(err) } else { callback() }
  })
}
describe('Users', () => {
  beforeEach((done) => {
    EmptyDatabase(done)
  })

  it('POST /users | Should create a new user', (done) => {
    const user = {
      username: 'brando',
      password: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    AddUser(user, () => {
      done()
    })
  })

  it('POST /users | Should not create a user with no username', (done) => {
    const user = {
      password: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    chai.request(server).post('/users/').send(user).end((err, res) => {
      should.exist(err)
      res.should.have.status(401)
      res.body.should.be.a('object')
      res.body.should.have.property('errors')
      res.body.errors.should.have.property('length').eql(1)
      done()
    })
  })

  it('POST /users | Should not create a user with no password', (done) => {
    const user = {
      username: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    chai.request(server).post('/users/').send(user).end((err, res) => {
      should.exist(err)
      res.should.have.status(401)
      res.body.should.be.a('object')
      res.body.should.have.property('errors')
      res.body.errors.length.should.be.eql(1)
      done()
    })
  })

  it(
    'POST /users | Should not create a new user with already existing username',
    (done) => {
      const user = {
        username: 'brando',
        password: 'brando',
        email: 'brando@brando.com',
        name: 'Brandon Danis'
      }

      const invalidUser = {
        username: 'brando',
        password: 'brando',
        email: 'brando1@brando.com',
        name: 'Brandon Danis'
      }

      AddUser(user, () => {
        AddInvalidUser(invalidUser, () => {
          done()
        })
      })
    })

  it('POST /users | Should not create a new user with already existing email',
    (done) => {
      const user = {
        username: 'brando',
        password: 'brando',
        email: 'brando@brando.com',
        name: 'Brandon Danis'
      }

      const invalidUser = {
        username: 'brando1',
        password: 'brando',
        email: 'brando@brando.com',
        name: 'Brandon Danis'
      }

      AddUser(user, () => {
        AddInvalidUser(invalidUser, () => {
          done()
        })
      })
    })

  it('GET /users/:username | Should give us the users info', (done) => {
    const user = {
      username: 'brando',
      password: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    AddUser(user, () => {
      chai.request(server).get(`/users/${user.username}`).end((err, res) => {
        should.not.exist(err)
        res.should.have.status(202)
        res.body.should.be.a('object')
        res.body.should.have.property('errors')
        res.body.errors.length.should.be.eql(0)
        res.body.should.have.property('data')
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
        done()
      })
    })
  })

  it('POST /users/login | Should login user', (done) => {
    const user = {
      username: 'brando',
      password: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    AddUser(user, () => {
      chai.request(server).post('/users/login').send(user).end((err, res) => {
        should.not.exist(err)
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('errors')
        res.body.errors.length.should.be.eql(0)
        res.body.should.have.property('data')
        res.body.data.should.be.a('string')
        done()
      })
    })
  })

  it('PUT /user/profile_picture | Should allow user to update his profile picture', (done) => {
    const user = {
      username: 'brando',
      password: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    const imageUrl = 'myimage.png'

    AddUser(user, () => {
      LoginUser(user, (token) => {
        chai.request(server).put('/users/profile_picture').set('token', token).send({image_url: imageUrl}).end((err, res) => {
          should.not.exist(err)
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          res.body.errors.length.should.be.eql(0)
          res.body.should.have.property('data')
          res.body.should.have.property('data').eql('Successfully updated your user profile')
          chai.request(server).get(`/users/${user.username}`).end((err, res) => {
            should.not.exist(err)
            res.should.have.status(202)
            res.body.should.be.a('object')
            res.body.should.have.property('errors')
            res.body.errors.length.should.be.eql(0)
            res.body.should.have.property('data')
            res.body.data.should.have.property('profile_picture_url')
            res.body.data.should.have.property('profile_picture_url').eql(imageUrl)
            done()
          })
        })
      })
    })
  })

  it(
    'PUT /user/background_picture | Should allow user to update his background picture',
    (done) => {
      const user = {
        username: 'brando',
        password: 'brando',
        email: 'brando@brando.com',
        name: 'Brandon Danis'
      }

      const imageUrl = 'my_bg_image.png'

      AddUser(user, () => {
        LoginUser(user, (token) => {
          chai.request(server).put('/users/background_picture').set('token', token).send({image_url: imageUrl}).end((err, res) => {
            should.not.exist(err)
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('errors')
            res.body.errors.length.should.be.eql(0)
            res.body.should.have.property('data')
            res.body.should.have.property('data').eql('Successfully updated your user profile')
            chai.request(server).get(`/users/${user.username}`).end((err, res) => {
              should.not.exist(err)
              res.should.have.status(202)
              res.body.should.be.a('object')
              res.body.should.have.property('errors')
              res.body.errors.length.should.be.eql(0)
              res.body.should.have.property('data')
              res.body.data.should.have.property('profile_background_url')
              res.body.data.should.have.property('profile_background_url').eql(imageUrl)
              done()
            })
          })
        })
      })
    })
})

const SubmitPost = (post, token, callback) => {
  chai.request(server).post('/posts').set('token', token).send(post).end((err, res) => {
    should.not.exist(err)
    res.should.have.status(200)
    res.body.should.be.a('object')
    res.body.should.have.property('errors')
    res.body.errors.length.should.be.eql(0)
    callback(res.body.data)
  })
}
describe('Posts', () => {
  beforeEach((done) => {
    EmptyDatabase(() => {
      done()
    })
  })

  it('GET /posts | Should return empty list of posts', (done) => {
    chai.request(server).get('/posts').end((err, res) => {
      should.not.exist(err)
      res.should.have.status(200)
      res.body.should.be.a('object')
      res.body.should.have.property('errors')
      res.body.errors.length.should.be.eql(0)
      res.body.should.have.property('data')
      res.body.data.should.be.a('array')
      res.body.data.length.should.be.eql(0)
      done()
    })
  })

  it('POST /posts | Should submit a new post', (done) => {
    const user = {
      username: 'brando',
      password: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    const post = {
      url: 'myurl.png',
      description: 'Test Desc',
      tags: 'Tags'
    }

    AddUser(user, () => {
      LoginUser(user, (token) => {
        SubmitPost(post, token, () => {
          chai.request(server).get('/posts').end((err, res) => {
            should.not.exist(err)
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('errors')
            res.body.errors.length.should.be.eql(0)
            res.body.should.have.property('data')
            res.body.data.should.be.a('array')
            res.body.data.length.should.be.eql(1)
            res.body.data[0].should.have.property('description')
            res.body.data[0].should.have.property('description').eql(post.description)
            res.body.data[0].should.have.property('image_url')
            res.body.data[0].should.have.property('image_url').eql(post.url)
            res.body.data[0].should.have.property('username')
            res.body.data[0].should.have.property('username').eql(user.username)
            res.body.data[0].should.have.property('description')
            done()
          })
        })
      })
    })
  })

  it('POST /posts | Should not submit a new post when unauthorized', (done) => {
    const user = {
      username: 'brando',
      password: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    const post = {
      url: 'myurl.png',
      description: 'Test Desc',
      tags: 'Tags'
    }

    AddUser(user, () => {
      LoginUser(user, (token) => {
        chai.request(server).post('/posts').send(post).end((err, res) => {
          should.exist(err)
          res.should.have.status(401)
          res.body.should.be.a('object')
          res.body.should.have.property('errors')
          res.body.errors.length.should.be.eql(1)
          res.body.errors[0].should.have.property('title')
          res.body.errors[0].should.have.property('title').eql('Bad token')
          done()
        })
      })
    })
  })

  it('GET /posts/id/:id | Should get a post by id', (done) => {
    const user = {
      username: 'brando',
      password: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    const post = {
      url: 'myurl.png',
      description: 'Test Desc',
      tags: 'Tags'
    }

    AddUser(user, () => {
      LoginUser(user, (token) => {
        SubmitPost(post, token, (postInfo) => {
          chai.request(server).get(`/posts/id/${postInfo.id}`).end((err, res) => {
            should.not.exist(err)
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('errors')
            res.body.errors.length.should.be.eql(0)
            res.body.should.have.property('data')
            res.body.data.should.have.property('description')
            res.body.data.should.have.property('description').eql(post.description)
            res.body.data.should.have.property('image_url')
            res.body.data.should.have.property('image_url').eql(post.url)
            done()
          })
        })
      })
    })
  })

  it('POST /posts/like/:id | Should like a post by id', (done) => {
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

    AddUser(user, () => {
      AddUser(user2, () => {
        LoginUser(user, (token) => {
          LoginUser(user2, (token2) => {
            SubmitPost(post, token, (postInfo) => {
              chai.request(server).post(`/posts/like/${postInfo.id}`).set('token', token2).send({id: postInfo.id}).end((err, res) => {
                should.not.exist(err)
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('errors')
                res.body.errors.length.should.be.eql(0)
                res.body.should.have.property('data')
                done()
              })
            })
          })
        })
      })
    })
  })

  it('DELETE /posts | Should delete newly added post', (done) => {
    const user = {
      username: 'brando',
      password: 'brando',
      email: 'brando@brando.com',
      name: 'Brandon Danis'
    }

    const post = {
      url: 'myurl.png',
      description: 'Test Desc',
      tags: 'Tags'
    }

    AddUser(user, () => {
      LoginUser(user, (token) => {
        SubmitPost(post, token, (postInfo) => {
          chai.request(server).delete('/posts/').set('token', token).send({post: postInfo.id}).end((err, res) => {
            should.not.exist(err)
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('errors')
            res.body.errors.length.should.be.eql(0)
            res.body.should.have.property('data')
            res.body.should.have.property('data').eql(null)
            done()
          })
        })
      })
    })
  })

  it('DELETE /posts | Should not delete post when header is not set',
    (done) => {
      const user = {
        username: 'brando',
        password: 'brando',
        email: 'brando@brando.com',
        name: 'Brandon Danis'
      }

      const post = {
        url: 'myurl.png',
        description: 'Test Desc',
        tags: 'Tags'
      }

      AddUser(user, () => {
        LoginUser(user, (token) => {
          SubmitPost(post, token, (postInfo) => {
            chai.request(server).delete('/posts/').send({post: postInfo.id}).end((err, res) => {
              should.exist(err)
              res.should.have.status(401)
              res.body.should.be.a('object')
              res.body.should.have.property('errors')
              res.body.errors.length.should.be.eql(1)
              res.body.errors[0].should.have.property('title')
              res.body.errors[0].should.have.property('title').eql('Bad token')
              done()
            })
          })
        })
      })
    })
})

const FollowUser = (token, userIdToFollow, callback) => {
  chai.request(server).post('/follow').set('token', token).send({
    followUsername: userIdToFollow
  }).end((err, res) => {
    should.not.exist(err)
    res.should.have.status(200)
    res.body.should.be.a('object')
    res.body.should.have.property('errors')
    res.body.errors.length.should.be.eql(0)
    res.body.should.have.property('data')
    res.body.should.have.property('data').eql('Now Following')
    callback()
  })
}
describe('Follow', () => {
  beforeEach((done) => {
    EmptyDatabase(() => {
      done()
    })
  })

  it(
    'GET /follow/getAllFollowing/:userId | Should return empty list of following',
    (done) => {
      chai.request(server).get('/follow/getAllFollowing/1').end((err, res) => {
        should.not.exist(err)
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('errors')
        res.body.errors.length.should.be.eql(0)
        res.body.should.have.property('data')
        res.body.data.should.be.a('array')
        res.body.data.length.should.be.eql(0)
        done()
      })
    })

  it(
    'GET /follow/getAllFollowers/:userId | Should return empty list of followers',
    (done) => {
      chai.request(server).get('/follow/getAllFollowing/1').end((err, res) => {
        should.not.exist(err)
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('errors')
        res.body.errors.length.should.be.eql(0)
        res.body.should.have.property('data')
        res.body.data.should.be.a('array')
        res.body.data.length.should.be.eql(0)
        done()
      })
    })

  it('POST /follow | User1 should be following User2', (done) => {
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

    AddUser(user1, () => {
      AddUser(user2, (secondUsername) => {
        LoginUser(user1, (token) => {
          chai.request(server).post('/follow').set('token', token).send({
            followUsername: secondUsername
          }).end((err, res) => {
            should.not.exist(err)
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('errors')
            res.body.errors.length.should.be.eql(0)
            res.body.should.have.property('data')
            res.body.should.have.property('data').eql('Now Following')
            done()
          })
        })
      })
    })
  })

  it('POST /follow | User should not be able to follow a non-existent user',
    (done) => {
      const user1 = {
        username: 'brando',
        password: 'brando',
        email: 'brando@brando.com',
        name: 'Brandon Danis'
      }

      AddUser(user1, () => {
        LoginUser(user1, (token) => {
          chai.request(server).post('/follow').set('token', token).send({
            followUsername: 'rushil'
          }).end((err, res) => {
            should.exist(err)
            res.should.have.status(401)
            res.body.should.be.a('object')
            res.body.should.have.property('errors')
            res.body.errors.length.should.be.eql(1)
            res.body.errors[0].should.have.property('title')
            res.body.errors[0].should.have.property('title').eql('User doesn\'t exist')
            done()
          })
        })
      })
    })

  it('POST /follow | User should be told if already following another user',
    (done) => {
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

      AddUser(user1, () => {
        AddUser(user2, (secondUsername) => {
          LoginUser(user1, (token) => {
            FollowUser(token, secondUsername, () => {
              chai.request(server).post('/follow').set('token', token).send({
                followUsername: secondUsername
              }).end((err, res) => {
                should.not.exist(err)
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('errors')
                res.body.errors.length.should.be.eql(0)
                res.body.should.have.property('data')
                res.body.should.have.property('data').eql('Already following')
                done()
              })
            })
          })
        })
      })
    })

  it('DELETE /follow | User should be able to unfollow a user', (done) => {
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

    AddUser(user1, () => {
      AddUser(user2, (secondUsername) => {
        LoginUser(user1, (token) => {
          FollowUser(token, secondUsername, () => {
            chai.request(server).delete('/follow').set('token', token).send({
              unfollowUsername: secondUsername
            }).end((err, res) => {
              should.not.exist(err)
              res.should.have.status(200)
              res.body.should.be.a('object')
              res.body.should.have.property('errors')
              res.body.errors.length.should.be.eql(0)
              res.body.should.have.property('data')
              res.body.should.have.property('data').eql(`You have unfollowed ${secondUsername}`)
              done()
            })
          })
        })
      })
    })
  })

  it(
    'DELETE /follow | User should be able to attempt to unfollow a non-existent user',
    (done) => {
      const user1 = {
        username: 'brando',
        password: 'brando',
        email: 'brando@brando.com',
        name: 'Brandon Danis'
      }

      AddUser(user1, () => {
        LoginUser(user1, (token) => {
          chai.request(server).delete('/follow').set('token', token).send({
            unfollowUsername: 'rushil'
          }).end((err, res) => {
            should.not.exist(err)
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('errors')
            res.body.errors.length.should.be.eql(0)
            res.body.should.have.property('data')
            res.body.should.have.property('data').eql(`You have unfollowed rushil`)
            done()
          })
        })
      })
    })

  it(
    'GET /users/:username | Should be able to see who is following when requesting user',
    (done) => {
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

      AddUser(user1, (firstUsername) => {
        AddUser(user2, (secondUsername) => {
          LoginUser(user1, (token) => {
            FollowUser(token, secondUsername, () => {
              chai.request(server).get(`/users/${user2.username}`).end((err, res) => {
                should.not.exist(err)
                res.should.have.status(202)
                res.body.should.be.a('object')
                res.body.should.have.property('errors')
                res.body.errors.length.should.be.eql(0)
                res.body.should.have.property('data')
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
                done()
              })
            })
          })
        })
      })
    })

  it('GET /users/:username | Should be able to see who the user is following',
    (done) => {
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

      AddUser(user1, () => {
        AddUser(user2, (secondUsername) => {
          LoginUser(user1, (token) => {
            FollowUser(token, secondUsername, () => {
              chai.request(server).get(`/users/${user1.username}`).end((err, res) => {
                should.not.exist(err)
                res.should.have.status(202)
                res.body.should.be.a('object')
                res.body.should.have.property('errors')
                res.body.errors.length.should.be.eql(0)
                res.body.should.have.property('data')
                res.body.data.should.have.property('name')
                res.body.data.should.have.property('name').eql(`${user1.name}`)
                res.body.data.should.have.property('username')
                res.body.data.should.have.property('username').eql(`${user1.username}`)
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
                done()
              })
            })
          })
        })
      })
    })
})
