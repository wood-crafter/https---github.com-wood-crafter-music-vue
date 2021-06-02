const db = require('./db')
const connection = db.getConnection()

const addSong = (song_id, playlist_id) => {
  const playlist_song = {
    song_id: song_id,
    playlist_id: playlist_id
  }
  return new Promise((resolve, rejects) => {
    connection.query("INSERT INTO playlist_song SET ?", playlist_song, (e, result, fields) => {
      if(e){
        rejects(e)
        return
      }

      resolve(result)
    })
  })
}

const addOne = (userId, title) => {
  const playlist = {
    user_id: userId,
    title: title
  }
  return new Promise((resolve, rejects) => {
    connection.query("INSERT INTO playlist SET ?", playlist, (e, result, fields) => {
      if(e){
        rejects(e)
        return
      }

      resolve(result)
    })
  })
}

const remove = (id) => {
  return new Promise((resolve, rejects) => {
    connection.query("DELETE FROM playlist WHERE id = ?", id, (e, result, fields) => {
      if(e){
        rejects(e)
        return
      }

      resolve(result)
    })
  })
}

const getSong = (song_id, playlist_id) => {
  return new Promise((resolve, rejects) => {
    connection.query('SELECT * FROM playlist_song WHERE song_id = ? AND playlist_id = ?', [song_id, playlist_id], (e, result, fields) => {
      if(e){
        rejects(e)
        return
      }

      resolve(result[0])
    })
  })
}

const getAllSong = (playlist_id) => {
  return new Promise((resolve, rejects) => {
    connection.query('SELECT song_id FROM playlist_song WHERE playlist_id = ?', playlist_id, (e, result, fields) => {
      if(e){
        rejects(e)
        return
      }

      resolve(result)
    })
  })
}

const removeSong = (song_id, playlist_id) => {
  return new Promise((resolve, rejects) => {
    connection.query("DELETE FROM playlist_song WHERE (song_id = ? AND playlist_id = ?)", [song_id, playlist_id], (e, result, fields) => {
      if(e){
        rejects(e)
        return
      }

      resolve(result)
    })
  })
} 

const getAll = (user_id) => {
  return new Promise((resolve, rejects) => {
    connection.query('SELECT * FROM playlist WHERE user_id = ?', user_id, (e, result, fields) => {
      if(e){
        rejects(e)
        return
      }

      resolve(result)
    })
  })
}

module.exports = {
  addOne,
  remove,
  addSong,
  getSong,
  removeSong,
  getAll,
  getAllSong,
  
}