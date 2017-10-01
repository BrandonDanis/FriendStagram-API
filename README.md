# FriendStagram API
<img src="https://travis-ci.org/BrandonDanis/FriendStagram-API.svg?branch=master"></img>
[![Coverage Status](https://coveralls.io/repos/github/BrandonDanis/FriendStagram-API/badge.svg?branch=master)](https://coveralls.io/github/BrandonDanis/FriendStagram-API?branch=master)<br>
Backend server for FriendStagram. Written with Javascript, Node.js & Postgres.

## Endpoints
### Users
```javascript
var users = 'routes/user-route.js';
GET /users //Returns all users & their posts
DELETE /users //Delete the user. Authenticated.
POST /users/login //Loging in. Return session token used for authentication
GET /users/logout //Deletes users session. Authenticated.
GET /users/logoffallothersessions //Deletes all other session tied to the account. Authenticated.
GET /users/:username //Return user info + posts about the specific user
```

### Posts
```javascript
var posts = 'routes/post-route.js';
GET /posts //Return all posts. Parameters available to sort,limit,offset and search
GET /posts/id/:id //Return info about post with specific id
POST /posts //Upload a post. Authenticated.
DELETE /posts //Ability to delete a post. Authenticated.
```

### Following
```javascript
var follows = 'routes/follow-routes.js';
GET /follow/getAllFollowing/:userId //Returns all users that this user follows
GET /follow/getAllFollowers/:userId //Returns all users that this user is followed by
POST /follow //Follow a user. Authenticated
DELETE /follow //Unfollows a user. Authenticated
```

## Features
- User sessions with JWT
- Password hashing using BCrypt
- Scalable
- Image hosting using Cloudinary

## Setup

#### Environment Variables
* DB_URL = your database url
* TEST_DB_URL = your test database url
* SECRET_KEY = any string of your choice

#### Instructions
* Clone repo
* Instal latest version of Node and run 'npm install' to install all npm modules
* Install PostgreSQL, create a database and use the schema provided in the repo (database/db.sql)
* * You can also setup a test database with the same schema but a different database name
* Populate the environment variables needed
* Run 'npm test' to ensure you have correctly setup your Environment
* Start the api by running 'npm start'
