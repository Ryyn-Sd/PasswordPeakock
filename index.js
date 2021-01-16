require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const User = mongoose.model('User', { sub: String, passwords: [ {
  name: String,
  url: String,
  email: String,
  username: String,
  password: String
} ]});
app.use(cookieParser())

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(express.static('public'))

const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

app.set('view engine', 'ejs')

app.use(auth(config));

app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.sendFile(path.resolve('./index.html'))
  } else {
     res.redirect('/login')
  }
});

app.post('/api/new', async (req, res) => {
  const user = (await User.findOne({ sub: req.oidc.user.sub })) || new User({ sub: req.oidc.user.sub })
  if (user.passwords.find(v => v.name === req.body.name)) return res.send('already exists')
  if (user.passwords) user.passwords.push(req.body)
  else user.passwords = [ req.body ]
  user.save()
  res.send('done')
})

app.get('/api/list', async (req, res) => {
  res.send(JSON.stringify((await User.findOne({ sub: req.oidc.user.sub })).passwords))
})

// app.post('/api/deleteAll', async (req, res) => {
//   const user = await User.findOne({ sub: req.oidc.user.sub })
//   if (!user) return res.send('error')
//   user.passwords = [ ]
//   user.save()
//   res.send('done')
// })

app.post('/api/delete', async (req, res) => {
  const user = await User.findOne({ sub: req.oidc.user.sub })
  if (!user) return res.send('error')
  console.log(req.body)
  const index = user.passwords.findIndex(v => v.name === req.body.name)
  if (index < 0 || index >= user.passwords.length) return res.send('not found')
  user.passwords.splice(index, 1)
  user.save()
  res.send('done')
})

app.listen(3000)
