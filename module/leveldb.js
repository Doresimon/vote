var level = require('level')
 
var ins = {
    root:{
        db: level('./LEVELDB'),
        system:{
            db: level('./LEVELDB/system'),
        },
        user:{
            db: level('./LEVELDB/user'),
        },
        vote:{
            db: level('./LEVELDB/vote'),
            list:{
                db: level('./LEVELDB/vote/list'),
            },
            detail:{
                db: level('./LEVELDB/vote/detail'),
            },
            participant:{
                db: level('./LEVELDB/vote/participant'),
            },
            executer:{
                db: level('./LEVELDB/vote/executer'),
            },
        },
    },
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

module.exports = ins