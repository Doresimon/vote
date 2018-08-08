var level = require('level')
let DBUtil = require('../module/leveldb');
 
let vote = {
    addVote: async function(D){
        let db_vote = DBUtil.root.vote.db
        let db_vote_list = DBUtil.root.vote.list.db

        let count = await DBUtil.get(db_vote, "count")
        count.value++

        D.ID = count.value
        // D.date = (new Date()).setTime((new Date()).getTime() + 8*60*60).toISOString()
        D.date = (new Date()).toISOString().substr(0,10)

        
        console.log("D", D)
        console.log("count.value", count.value)

        await db_vote_list.put(count.value, JSON.stringify(D))
        await db_vote.put("count", JSON.stringify(count))
    },
    getVoteList: async function(){
        let db_vote = DBUtil.root.vote.db
        let db_vote_list = DBUtil.root.vote.list.db

        let count = await DBUtil.get(db_vote, "count")

        console.log("count.value", count.value)

        let voteList = []

        for (let i = 1; i <= count.value; i++) {
            
            let one = await DBUtil.get(db_vote_list, i)
            voteList.push(one)
        }

        console.log(voteList)

        return voteList
    },
}

module.exports = vote