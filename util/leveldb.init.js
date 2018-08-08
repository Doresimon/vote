/* 
> node .\util\leveldb.init.js
use this script to create DB folder and files 
*/

let level = require('level')
let fs = require('fs')

/* Constant */
const Tree = {
    leveldb:{
        system:{},
        user:{},
        vote:{
            list:{},
            detail:{},
            participant:{},
            executer:{},
        },
    }
}
const root = './LEVELDB'

/* Function */
function checkDir(Dir){
    if (!fs.existsSync(Dir)){ 
        fs.mkdirSync(Dir); 
    }
}
async function checkDb(path, des){
    return (new Promise((resolve, reject) => {
        let db = level(path)
        console.log("[CHECK]", path)
        db.close(async function(err){
            for (const key in des) {
                await checkDir(path+"/"+key)
                await checkDb(path+"/"+key, des[key])
            }
            resolve(err)
        })

    }))
}

/* Main */
const main = async () => {
    
    await checkDir(root)
    await checkDb(root, Tree.leveldb)

    /* add users */
    const db_user = level('./LEVELDB/user')

    await db_user.put("boss",JSON.stringify({role:"admin", pass:"1024"}))
    await db_user.put("halo",JSON.stringify({role:"executer", pass:"0000"}))
    await db_user.put("hedy",JSON.stringify({role:"executer", pass:"9999"}))

    db_user.close()

    /* add vote info */
    const db_vote = level('./LEVELDB/vote')

    await db_vote.put("count",JSON.stringify({value:0}))

    db_vote.close()

    console.log("[DONE]")
}

main()


