const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const usersService = require('./user.service')
const playlistService = require('./playlist.service')
const songs = require('./song.service')

const app = express()
const PORT = 8081
const SECRET_KEY = 'HuckFitler'

app.use(cors())
app.use(express.json())

app.listen(PORT, () => {
  console.info(`Server started at http://localhost:${PORT}`)
})

app.post('/login', (req, res) => {
  const user = req.body

  usersService.findByUsername(user.username)
    .then(result => {
      if (!result) {
        console.info('user not found')
        res.send(404)
        return
      }

      bcrypt.compare(user.password, result.password, (e, fit) => {
        if (fit) {
          const token = jwt.sign({ username: user.username }, SECRET_KEY)
          console.info(token)
          res.send(token)
          return
        }
        console.info('Wrong password!')
        res.sendStatus(401)
        return
      })
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(e.statusCode)
    })
})

app.post('/signup', (req, res) => {
  const user = req.body
  const saltRounds = 10

  usersService.findByUsername(user.username)
    .then(result => {
      if (result) {
        console.info('Username existed!')
        res.sendStatus(400)
        return
      }

      return hashPromise(user.password, saltRounds)
    })
    .then(password => {
      return usersService.addOne(user.username, password)
    })
    .then(result => {
      const token = jwt.sign({ username: user.username }, SECRET_KEY)
      res.send(token)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(500)
    })
})

app.head('/auth', (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.sendStatus(401)
    return
  }

  const token = authHeader.substring('Bearer '.length)

  jwt.verify(token, SECRET_KEY, (err, payload) => {
    if (err) {
      console.error(err)
      res.sendStatus(401)
      return
    }
    res.sendStatus(200)
  })
})

app.delete('/playlist/song', async (req, res) => {
  try {
    const playlist_id = req.body.playlist_id
    const song_id = req.body.song_id

    await playlistService.removeSong(song_id, playlist_id)
    res.sendStatus(200)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }

})


app.post('/playlist/song', (req, res) => {
  const playlist_id = req.body.playlist_id
  const song_id = req.body.song_id

  playlistService.getSong(song_id, playlist_id)
    .then(result => {
      if (result) {
        console.info(result)
        console.info('Playlist already contain this song!')
        res.sendStatus(409)
        return
      }

      playlistService.addSong(song_id, playlist_id)
      res.sendStatus(200)
    })
})

app.get('/playlist/song', (req, res) => {
  const playlist_id = req.body.playlist_id

  playlistService.getAllSong(playlist_id)
    .then(result => {
      if (!result) {
        console.info('No result!')
        res.sendStatus(400)
        return
      }
      const songs_id = new Array()

      result.forEach(element => {
        songs_id.push(element.song_id)
      });
      return songs.getByListID(songs_id)
    })
    .then(songs => {
      res.send(songs)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(400)
    })
})

app.get('/playlist', (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader.substring('Bearer '.length)

  if (!token) {
    res.sendStatus(401)
  }

  verifyJwt(token)
    .then(payload => {
      return findAllPlaylist(payload.username)
    })
    .then(result => {
      res.send(result)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(400)
    })
})

app.post('/playlist', (req, res) => {
  const title = req.body.title
  const authHeader = req.headers.authorization
  const token = authHeader.substring('Bearer '.length)

  if (!token) {
    res.sendStatus(401)
  }

  verifyJwt(token)
    .then(payload => {
      return usersService.findByUsername(payload.username)
    })
    .then(user => {
      if (!user) {
        console.info('User not existed!')
        res.sendStatus(401)
        return
      }
      playlistService.addOne(user.id, title)
      res.sendStatus(200)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(400)
    })

})

app.delete('/playlist', (req, res) => {
  const id = req.body.id

  playlistService.remove(id)
    .then(result => {
      res.sendStatus(200)
    })
    .catch(e => {
      console.error(e)
      res.sendStatus(400)
    })
})

const hashPromise = (password, saltRounds) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function (e, hash) {
      if (e) {
        console.error(e)
        reject(e)
      }
      resolve(hash)
    })
  })
}

function findAllPlaylist(username) {
  return usersService.findByUsername(username).then(res => {
    const userId = res.id
    return playlistService.getAll(userId)
  })
}

function verifyJwt(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_KEY, (err, payload) => {
      if (err) {
        reject(err)
      } else {
        resolve(payload)
      }
    })
  })
}
