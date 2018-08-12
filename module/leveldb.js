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
                    return err
                }
                resolve(JSON.parse(value))
            })
        })
        return p
    },
    put: function(db, key, value){
        var p = new Promise((resolve, reject) => {
            db.put(key, JSON.stringify(value), function (err) {
                if (err) {
                    resolve(false)
                    return err
                }
                resolve(true)
            })
        })
        return p
    }
}

module.exports = ins