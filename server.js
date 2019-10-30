const { User } = require('./models')
const express = require('express')
const jwt = require('jsonwebtoken')

const app = express()

const SECRET = 'secret_key, not should in there'

app.use(express.json())

app.get('/api/users', async (req, res) => {
  const users = await User.find()
  res.send(users)
})

app.post('/api/register', async (req, res) => {
  const user = await User.create({
    username: req.body.username,
    password: req.body.password
  })
  res.send(user)
})

app.post('/api/login', async (req, res) => {
  const user = await User.findOne({
    username: req.body.username
  })
  if (!user) {
    return res.status(422).send({
      message: 'User is not exists!'
    })
  }
  const isPasswordValid = require('bcryptjs').compareSync(
    req.body.password,
    user.password
  )
  if (!isPasswordValid) {
    return res.status(422).send({
      message: 'Password is not valid!'
    })
  }

  // generate token
  const token = jwt.sign(
    {
      id: String(user._id)
    },
    SECRET
  )
  res.send({
    user,
    token: token
  })
})

const authMiddleware = async (req, res, next) => {
  const raw = String(req.headers.authorization)
    .split(' ')
    .pop()
  const { id } = jwt.verify(raw, SECRET)
  req.user = await User.findById(id)
  next()
}

app.get('/api/profile', authMiddleware, async (req, res) => {
  res.send(req.user)
})

app.listen(3000, () => {
  console.log('listening on 3000')
})
