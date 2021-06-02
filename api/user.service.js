const db = require('./db')
const connection = db.getConnection()

const findByUsername = (username) => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM user WHERE username = ?", username, (e, result, fields) => {
      if(e){
        console.error(e)
        reject(e)
      } else {
        resolve(result[0])
      }
    })
  })
}

const addOne = (username, password) => {
  const user = {
    username,
    password
  }
  return new Promise((resolve, reject) => {
    connection.query("INSERT INTO user SET ?", user, (e, result, fields) => {
      if(e){
        console.error(e)
        reject(e)
      } else {
        resolve(result)
      }
    })
  })
}

module.exports = {
  findByUsername,
  addOne,

}