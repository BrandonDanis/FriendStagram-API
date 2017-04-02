# FriendStagram API
<img src="https://travis-ci.org/BrandonDanis/FriendStagram-Backend.svg?branch=master"></img><br>

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
