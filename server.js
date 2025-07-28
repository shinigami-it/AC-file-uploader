const express = require("express")
const session = require("express-session")
const path = require("path")
const multer = require("multer")
const fs = require("fs")
const { exec } = require("child_process")
const dotenv = require("dotenv")
const crypto = require("crypto")
const fetch = require("node-fetch")
dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000
const PASSWORD = process.env.PASSWORD
const SESSION_SECRET = process.env.SESSION_SECRET
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

const carsDir = "/home/kmf/assetto-corsa/assetto/content/cars"
const tracksDir = "/home/kmf/assetto-corsa/assetto/content/tracks"

const upload = multer({ preservePath: true })

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }))

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64")
  res.locals.nonce = nonce
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self';`
  )
  next()
})

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  if (!req.session.authenticated) {
    res.redirect("/login")
    return
  }
  const filePath = path.join(__dirname, "protected", "index.html")
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error loading page")
      return
    }
    const htmlWithNonce = data.replace(/<script>/g, `<script nonce="${res.locals.nonce}">`)
    res.send(htmlWithNonce)
  })
})

app.get("/login", (req, res) => {
  const filePath = path.join(__dirname, "login.html")
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error loading page")
      return
    }
    const htmlWithNonce = data.replace(/<script>/g, `<script nonce="${res.locals.nonce}">`)
    res.send(htmlWithNonce)
  })
})

app.post("/login", (req, res) => {
  if (req.body.password === PASSWORD) {
    req.session.authenticated = true
    res.redirect("/")
  } else {
    res.redirect("/login")
  }
})

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login")
  })
})

app.use("/static", express.static(path.join(__dirname, "protected")))

app.post("/cars", upload.any(), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded")
  }

  req.files.forEach((file) => {
    const relPath = file.originalname
    const destPath = path.join(carsDir, relPath)
    const destDir = path.dirname(destPath)
    fs.mkdirSync(destDir, { recursive: true })
    fs.writeFileSync(destPath, file.buffer)
  })

  exec(`chown -R kmf:kmf ${carsDir}`, async (err) => {
    if (err) {
      return res.status(500).send("Failed to set ownership")
    }

    if (DISCORD_WEBHOOK_URL) {
      try {
        const firstFile = req.files[0].originalname
        const carName = firstFile.includes("/") ? firstFile.split("/")[0] : "(root folder)"
        const filesList = req.files.map(f => f.originalname).join("\n")

        const body = {
          embeds: [
            {
              title: `New car uploaded: ${carName}`,
              description: `**${req.files.length}** files uploaded`,
              color: 3066993,
              fields: [
                {
                  name: "Files",
                  value: filesList.length > 1024 ? filesList.slice(0, 1020) + "..." : filesList
                }
              ],
              timestamp: new Date().toISOString()
            }
          ]
        }

        await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        })
      } catch {
        // silently ignore webhook errors
      }
    }

    res.send("Cars uploaded with structure and ownership set")
  })
})

app.post("/tracks", upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded")
  }

  req.files.forEach((file) => {
    const relPath = file.originalname
    const destPath = path.join(tracksDir, relPath)
    const destDir = path.dirname(destPath)
    fs.mkdirSync(destDir, { recursive: true })
    fs.writeFileSync(destPath, file.buffer)
  })

  exec(`chown -R kmf:kmf ${tracksDir}`, (err) => {
    if (err) {
      return res.status(500).send("Failed to set ownership")
    }
    res.send("Tracks uploaded with structure and ownership set")
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Running at http://localhost:${PORT}`)
})