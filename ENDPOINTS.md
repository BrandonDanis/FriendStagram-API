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
    
GET /user/:username               //return specific user  

POST /login           
  Body:
    * username
    * password

PUT /user/:username               //modify user
  Header:
    * token
  Body:
    * password
    * (Future to allow other changes)

GET /logOff 
  Header:
    * token

GET /logOffAllOtherSessions       //log off all other sessions on other devices
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
    
GET /posts/:username
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
