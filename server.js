const express = require('express')
const session = require('express-session')
const path = require('path')
const multer = require('multer')
const fs = require('fs')
const { exec } = require('child_process')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const PORT = 3000

const PASSWORD = process.env.PASSWORD
const SESSION_SECRET = process.env.SESSION_SECRET

const carsDir = '/home/kmf/assetto-corsa/assetto/content/cars'
const tracksDir = '/home/kmf/assetto-corsa/assetto/content/tracks'

const storageCars = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(carsDir)) fs.mkdirSync(carsDir, { recursive: true })
    cb(null, carsDir)
  },
  filename: (req, file, cb) => cb(null, file.originalname)
})

const storageTracks = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(tracksDir)) fs.mkdirSync(tracksDir, { recursive: true })
    cb(null, tracksDir)
  },
  filename: (req, file, cb) => cb(null, file.originalname)
})

const uploadCars = multer({ storage: storageCars })
const uploadTracks = multer({ storage: storageTracks })

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))

app.get('/', (req, res) => {
  if (req.session.authenticated) res.sendFile(path.join(__dirname, 'protected', 'index.html'))
  else res.redirect('/login')
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'))
})

app.post('/login', (req, res) => {
  if (req.body.password === PASSWORD) {
    req.session.authenticated = true
    res.redirect('/')
  } else res.redirect('/login')
})

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login')
  })
})

app.use('/static', express.static(path.join(__dirname, 'protected')))

app.post('/upload/cars', uploadCars.array('files'), (req, res) => {
  exec(`chown -R kmf:kmf ${carsDir}`, () => res.send('Cars uploaded and ownership set'))
})

app.post('/upload/tracks', uploadTracks.array('files'), (req, res) => {
  exec(`chown -R kmf:kmf ${tracksDir}`, () => res.send('Tracks uploaded and ownership set'))
})

app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`)
})