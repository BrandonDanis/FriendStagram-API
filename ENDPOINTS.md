<strong>API Endpoints:</strong>

<strong>Users</strong>
```javascript

GET /users                        //returns all users

POST /users                       //register user
  Body:
    * username
    * password
    * name
    * email
    
GET /users/:username               //return specific user

POST /users/login
  Body:
    * username
    * password

PUT /users/:username               //modify user
  Header:
    * token
  Body:
    * password
    * (Future to allow other changes)

GET /users/logoff
  Header:
    * token

GET /users/logoffallothersessions       //log off all other sessions on other devices
  Header:
    * token

DELETE /users                     //delete user specified by token
  Header:
    * token
  Body:
    * password

```

<strong>Posts:</strong>
```javascript
POST /posts
  Header:
    * token 
  Body:
    * description
    * url
    * tags

GET /posts/id/:username

GET /posts/user/:username
GET /posts
  Query:
    * limit
    * sort
    * tags
    * offset
    
DELETE /posts
  Body:
    *postID
```
