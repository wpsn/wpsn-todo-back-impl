const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')

const query = require('./query')

const app = express()

app.use(bodyParser.json())

const jwtMiddleware = expressJwt({secret: 'mysecret'})

app.get('/user', jwtMiddleware, (req, res) => {
  query.getUserById(req.user.id)
    .then(user => {
      res.send({
        username: user.username
      })
    })
})

app.post('/user', (req, res) => {
  // 사용자 생성
  const {username, password} = req.body
  query.createUser(username, password)
    .then(([id]) => {
      // JWT 발행
      const token = jwt.sign({id}, 'mysecret')
      // 반환
      res.send({
        token
      })
    })
})

app.post('/login', (req, res) => {
  const {username, password} = req.body
  query.compareUser(username, password)
    .then(user => {
      const token = jwt.sign({id: user.id}, 'mysecret')
      res.send({
        token
      })
    })

})

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({
      error: err.name,
      message: err.message
    })
  }
});

app.listen(3000, () => {
  console.log('listening...')
})
