var level = require('level')
 
var db = {
    save: function(name, data){
        var db = level('./db/'+name)
        db.put(data.date, data, function (err) {
            db.close()
            if (err) return console.log('Ooops!', err) // some kind of I/O error
        })
    },
    get: function(db, key){
        var p = new Promise((resolve, reject) => {
            db.get(key, function (err, value) {
                if (err) {
                    if (err.notFound) {
                        resolve(JSON.parse("{}"))
                        return
                    }
                    // I/O or other error, pass it up the callback chain
                    resolve(null)
                    return callback(err)
                }
                resolve(JSON.parse(value))
            })
        })
        return p
    }
}

module.exports = db