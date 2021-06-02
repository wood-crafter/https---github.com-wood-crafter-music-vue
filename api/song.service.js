const db = require('./db')
const connection = db.getConnection()

const getByListID = (ids) => {
  return new Promise((resolve, rejects) => {
    connection.query('SELECT * FROM songs WHERE id IN (' + ids.join() + ')', (e, result, fields) => {
      if(e){
        rejects(e)
        return
      }

      resolve(result)
    })
  })
}

module.exports = {
  getByListID
}