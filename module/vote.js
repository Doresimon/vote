var level = require('level')
let DBUtil = require('../module/leveldb');
 
let vote = {
    addVote: async function(D){
        let db_vote = level('./LEVELDB/vote')
        let db_vote_list = level('./LEVELDB/vote/list')

        let count = await DBUtil.get(db_vote, "count")
        console.log("D", D)
        console.log("count.value", count.value)
        count.value++

        D.ID = count.value

        await db_vote_list.put(count.value, JSON.stringify(D))
        await db_vote.put("count", JSON.stringify(count))


        let ddd = await DBUtil.get(db_vote_list, 1)
        console.log("ddd", ddd)

        await db_vote.close()
        await db_vote_list.close()
    },
    getVoteList: async function(){
        let db_vote = level('./LEVELDB/vote')
        let db_vote_list = level('./LEVELDB/vote/list')

        let count = await DBUtil.get(db_vote, "count")

        console.log("count.value", count.value)

        let voteList = []

        for (let i = 1; i <= count.value; i++) {
            
            let one = await DBUtil.get(db_vote_list, i)
            voteList.push(one)
        }

        await db_vote.close()
        await db_vote_list.close()
        console.log(voteList)

        return voteList
    },
}

module.exports = vote