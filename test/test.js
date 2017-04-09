process.env.NODE_ENV = "test";

const db = require('pg-bricks').configure(process.env.TEST_DB_URL);
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();

chai.use(chaiHttp);

describe("Heartbeat", () => {
    it("Checking if server is alive", (done) => {
        chai.request(server)
            .get('/ping')
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
})

describe("Users", () => {

    beforeEach((done) => {
        EmptyDatabase(() => {
            done()
        })
    })

    it("POST /users | Should create a new user", (done) => {
        let user = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        AddUser(user, () => {
            done()
        })
    })

    it("POST /users | Should not create a user with no username", (done) => {
        let user = {
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        chai.request(server)
            .post("/users/")
            .send(user)
            .end((err,res) => {
                res.should.have.status(401)
                res.body.should.be.a('object')
                res.body.should.have.property('error')
                res.body.should.have.property('error').eql(true)
                done()
            })
    })

    it("POST /users | Should not create a user with no password", (done) => {
        let user = {
            "username": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        chai.request(server)
            .post("/users/")
            .send(user)
            .end((err,res) => {
                res.should.have.status(401)
                res.body.should.be.a('object')
                res.body.should.have.property('error')
                res.body.should.have.property('error').eql(true)
                done()
            })
    })

    it("POST /users | Should not create a new user with already existing username", (done) => {
        let user = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let invalidUser = {
            "username": "brando",
            "password": "brando",
            "email": "brando1@brando.com",
            "name": "Brandon Danis"
        }

        AddUser(user, () => {
            AddInvalidUser(invalidUser, () => {
                done()
            })
        })
    })

    it("POST /users | Should not create a new user with already existing email", (done) => {
        let user = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let invalidUser = {
            "username": "brando1",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        AddUser(user, () => {
            AddInvalidUser(invalidUser, () => {
                done()
            })
        })
    })

    it("GET /users/:username | Should give us the users info", (done) => {
        let user = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        AddUser(user, () => {
            chai.request(server)
                .get(`/users/${user.username}`)
                .end((err,res) => {
                    res.should.have.status(202)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error')
                    res.body.should.have.property('error').eql(false)
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
                    res.body.data.posts.should.be.a('array')
                    res.body.data.posts.length.should.be.eql(0)
                    res.body.data.should.have.property('following')
                    res.body.data.posts.should.be.a('array')
                    res.body.data.posts.length.should.be.eql(0)
                    done()
                })
        })
    })

    it("POST /users/login | Should login user", (done) => {
        let user = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        AddUser(user, () => {
            chai.request(server)
                .post("/users/login")
                .send(user)
                .end((err,res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('error')
                    res.body.should.have.property('error').eql(false)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a("string")
                    done()
                })
        })

    })

})

describe("Posts", () => {

    beforeEach((done) => {
        EmptyDatabase(() => {
            done()
        })
    })

    it("GET /posts | Should return empty list of posts", (done) => {
        chai.request(server)
            .get("/posts")
            .end((err,res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('error')
                res.body.should.have.property('error').eql(false)
                res.body.should.have.property('data')
                res.body.data.should.be.a("array")
                res.body.data.length.should.be.eql(0)
                done()
            })
    })

    it("POST /posts | Should submit a new post", (done) => {

        let user = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let post = {
            "url": "myurl.png",
            "description": "Test Desc",
            "tags": "Tags"
        }

        AddUser(user, () => {
            LoginUser(user, (token) => {
                SubmitPost(post, token, () => {
                    chai.request(server)
                        .get("/posts")
                        .end((err,res) => {
                            res.should.have.status(200)
                            res.body.should.be.a('object')
                            res.body.should.have.property('error')
                            res.body.should.have.property('error').eql(false)
                            res.body.should.have.property('data')
                            res.body.data.should.be.a("array")
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

    it("POST /posts | Should not submit a new post when unauthorized", (done) => {

        let user = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let post = {
            "url": "myurl.png",
            "description": "Test Desc",
            "tags": "Tags"
        }

        AddUser(user, () => {
            LoginUser(user, (token) => {
                chai.request(server)
                    .post("/posts")
                    .send(post)
                    .end((err,res) => {
                        res.should.have.status(401)
                        res.body.should.be.a('object')
                        res.body.should.have.property('error')
                        res.body.should.have.property('error').eql(true)
                        res.body.should.have.property('data')
                        res.body.should.have.property('data').eql("bad token")
                        done()
                    })
            })

        })

    })

    it("GET /posts/id/:id | Should get a post by id", (done) => {

        let user = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let post = {
            "url": "myurl.png",
            "description": "Test Desc",
            "tags": "Tags"
        }

        AddUser(user, () => {
            LoginUser(user, (token) => {
                SubmitPost(post, token, (post_info) => {
                    chai.request(server)
                        .get(`/posts/id/${post_info.id}`)
                        .end((err,res) => {
                            res.should.have.status(200)
                            res.body.should.be.a('object')
                            res.body.should.have.property('error')
                            res.body.should.have.property('error').eql(false)
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

    it("DELETE /posts | Should delete newly added post", (done) => {

        let user = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let post = {
            "url": "myurl.png",
            "description": "Test Desc",
            "tags": "Tags"
        }

        AddUser(user, () => {
            LoginUser(user, (token) => {
                SubmitPost(post, token, (post_info) => {
                    chai.request(server)
                        .delete("/posts/")
                        .set('token', token)
                        .send({post: post_info["id"]})
                        .end((err,res) => {
                            res.should.have.status(200)
                            res.body.should.be.a('object')
                            res.body.should.have.property('error')
                            res.body.should.have.property('error').eql(false)
                            res.body.should.have.property('data')
                            res.body.should.have.property('data').eql(null)
                            done()
                        })
                })
            })
        })

    })

    it("DELETE /posts | Should not delete post when header is not set", (done) => {

        let user = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let post = {
            "url": "myurl.png",
            "description": "Test Desc",
            "tags": "Tags"
        }

        AddUser(user, () => {
            LoginUser(user, (token) => {
                SubmitPost(post, token, (post_info) => {
                    chai.request(server)
                        .delete("/posts/")
                        .send({post: post_info["id"]})
                        .end((err,res) => {
                            res.should.have.status(401)
                            res.body.should.be.a('object')
                            res.body.should.have.property('error')
                            res.body.should.have.property('error').eql(true)
                            res.body.should.have.property('data')
                            res.body.should.have.property('data').eql("bad token")
                            done()
                        })
                })
            })
        })

    })

})

describe("Follow", () => {

    beforeEach((done) => {
        EmptyDatabase(() => {
            done()
        })
    })

    it("GET /follow/getAllFollowing/:userId | Should return empty list of following", (done) => {
        chai.request(server)
            .get("/follow/getAllFollowing/1")
            .end((err,res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('error')
                res.body.should.have.property('error').eql(false)
                res.body.should.have.property('data')
                res.body.data.should.be.a("array")
                res.body.data.length.should.be.eql(0)
                done()
            })
    })

    it("GET /follow/getAllFollowers/:userId | Should return empty list of followers", (done) => {
        chai.request(server)
            .get("/follow/getAllFollowing/1")
            .end((err,res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('error')
                res.body.should.have.property('error').eql(false)
                res.body.should.have.property('data')
                res.body.data.should.be.a("array")
                res.body.data.length.should.be.eql(0)
                done()
            })
    })

    it("POST /follow | User1 should be following User2", (done) => {
        let user1 = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let user2 = {
            "username": "brando2",
            "password": "brando2",
            "email": "brando2@brando.com",
            "name": "Brandon Danis"
        }

        AddUser(user1, () => {
            AddUser(user2, (user2_id) => {
                LoginUser(user1, (token) => {
                    chai.request(server)
                        .post("/follow")
                        .set('token', token)
                        .send({
                            "userIdToFollow": user2_id
                        })
                        .end((err,res) => {
                            res.should.have.status(200)
                            res.body.should.be.a('object')
                            res.body.should.have.property('error')
                            res.body.should.have.property('error').eql(false)
                            res.body.should.have.property('status')
                            res.body.should.have.property('status').eql('Now Following')
                            done()
                        })
                })
            })
        })
    })

    it("POST /follow | User should not be able to follow a non-existant user", (done) => {
        let user1 = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        AddUser(user1, () => {
            LoginUser(user1, (token) => {
                chai.request(server)
                    .post("/follow")
                    .set('token', token)
                    .send({
                        "userIdToFollow": -1
                    })
                    .end((err,res) => {
                        res.should.have.status(401)
                        res.body.should.be.a('object')
                        res.body.should.have.property('error')
                        res.body.should.have.property('error').eql(true)
                        res.body.should.have.property('status')
                        res.body.should.have.property('status').eql('User doesn\'t exist')
                        done()
                    })
            })
        })
    })

    it("POST /follow | User should be told if already following another user", (done) => {
        let user1 = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let user2 = {
            "username": "brando2",
            "password": "brando2",
            "email": "brando2@brando.com",
            "name": "Brandon Danis"
        }

        AddUser(user1, () => {
            AddUser(user2, (user2_id) => {
                LoginUser(user1, (token) => {
                    FollowUser(token, user2_id, () => {
                        chai.request(server)
                            .post("/follow")
                            .set('token', token)
                            .send({
                                "userIdToFollow": user2_id
                            })
                            .end((err,res) => {
                                res.should.have.status(200)
                                res.body.should.be.a('object')
                                res.body.should.have.property('error')
                                res.body.should.have.property('error').eql(false)
                                res.body.should.have.property('status')
                                res.body.should.have.property('status').eql('Already following')
                                done()
                            })
                    })
                })
            })
        })
    })

    it("DELETE /follow | User should be able to unfollow a user", (done) => {
        let user1 = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let user2 = {
            "username": "brando2",
            "password": "brando2",
            "email": "brando2@brando.com",
            "name": "Brandon Danis"
        }

        AddUser(user1, () => {
            AddUser(user2, (user2_id) => {
                LoginUser(user1, (token) => {
                    FollowUser(token, user2_id, () => {
                        chai.request(server)
                            .delete("/follow")
                            .set('token', token)
                            .send({
                                "userIdToFollow": user2_id
                            })
                            .end((err,res) => {
                                res.should.have.status(200)
                                res.body.should.be.a('object')
                                res.body.should.have.property('error')
                                res.body.should.have.property('error').eql(false)
                                res.body.should.have.property('status')
                                res.body.should.have.property('status').eql('Unfollowed')
                                done()
                            })
                    })
                })
            })
        })
    })

    it("DELETE /follow | User should be able to unfollow a user", (done) => {
        let user1 = {
            "username": "brando",
            "password": "brando",
            "email": "brando@brando.com",
            "name": "Brandon Danis"
        }

        let user2 = {
            "username": "brando2",
            "password": "brando2",
            "email": "brando2@brando.com",
            "name": "Brandon Danis"
        }

        AddUser(user1, () => {
            LoginUser(user1, (token) => {
                chai.request(server)
                    .delete("/follow")
                    .set('token', token)
                    .send({
                        "userIdToFollow": -1
                    })
                    .end((err,res) => {
                        res.should.have.status(200)
                        res.body.should.be.a('object')
                        res.body.should.have.property('error')
                        res.body.should.have.property('error').eql(false)
                        res.body.should.have.property('status')
                        res.body.should.have.property('status').eql('Unfollowed')
                        done()
                    })
            })
        })
    })

})

AddUser = (user, callback) => {
    chai.request(server)
        .post("/users/")
        .send(user)
        .end((err,res) => {
            res.should.have.status(201)
            res.body.should.be.a('object')
            res.body.should.have.property('error')
            res.body.should.have.property('error').eql(false)
            res.body.should.have.property('data')
            callback(res["body"]["data"])
        })
}

AddInvalidUser = (user, callback) => {
    chai.request(server)
        .post("/users/")
        .send(user)
        .end((err,res) => {
            res.should.have.status(500)
            res.body.should.be.a('object')
            res.body.should.have.property('error')
            res.body.should.have.property('error').eql(true)
            callback()
        })
}

FollowUser = (token, userIdToFollow, callback) => {
    chai.request(server)
        .post("/follow")
        .set('token', token)
        .send({
            "userIdToFollow": userIdToFollow
        })
        .end((err,res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('error')
            res.body.should.have.property('error').eql(false)
            res.body.should.have.property('status')
            res.body.should.have.property('status').eql('Now Following')
            callback()
        })
}

LoginUser = (user, callback) => {
    chai.request(server)
        .post("/users/login")
        .send(user)
        .end((err,res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('error')
            res.body.should.have.property('error').eql(false)
            res.body.should.have.property('data')
            callback(res["body"]["data"])
        })
}

SubmitPost = (post, token, callback) => {
    chai.request(server)
        .post("/posts")
        .set('token', token)
        .send(post)
        .end((err,res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('error')
            res.body.should.have.property('error').eql(false)
            callback(res["body"]["data"])
        })
}

EmptyDatabase = (callback) => {
    db.raw("DELETE FROM USERS_SESSIONS").rows((err,rows) => {
        db.raw("DELETE FROM USERS_FOLLOWS").rows((err,rows) => {
            db.raw("DELETE FROM POSTS").rows((err,rows) => {
                db.raw("DELETE FROM USERS").rows((err,rows) => {
                    callback()
                })
            })
        })
    })
}
