require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
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

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const { auth, requiresAuth } = require('express-openid-connect');

app.use(auth({
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
}));

app.get('/', requiresAuth(), (req, res) => {
  res.sendFile(path.resolve('./src/index.html'))
});

app.post('/api/new', async (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.send('logged out')
  const user = (await User.findOne({ sub: req.oidc.user.sub })) || new User({ sub: req.oidc.user.sub })
  if (user.passwords.find(v => v.name === req.body.name)) return res.send('already exists')
  if (user.passwords) user.passwords.push(req.body)
  else user.passwords = [ req.body ]
  user.save()
  res.send('done')
})

app.get('/api/list', async (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.send('logged out')
  res.send(JSON.stringify((await User.findOne({ sub: req.oidc.user.sub })).passwords))
})

app.post('/api/delete', async (req, res) => {
  if (!req.oidc.isAuthenticated()) return res.send('logged out')
  const user = await User.findOne({ sub: req.oidc.user.sub })
  if (!user) return res.send('error')
  console.log(req.body)
  console.log(user.passwords.map(v => typeof v._id))
  const index = user.passwords.findIndex(v => v._id.toString() === req.body.id.toString())
  if (index < 0 || index >= user.passwords.length) return res.send('not found')
  user.passwords.splice(index, 1)
  user.save()
  res.send('done')
})

module.exports = app
