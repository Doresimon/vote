let level = require('level')
let DBUtil = require('../module/leveldb');
let crypto = require('crypto');
 
let vote = {
    addVote: async function(D){
        let db_user = DBUtil.root.user.db
        let db_vote = DBUtil.root.vote.db
        let db_vote_list = DBUtil.root.vote.list.db

        let count = await DBUtil.get(db_vote, "count")
        count.value++

        D.ID = count.value
        D.date = (new Date()).toISOString().substr(0,10)

        let exec = []
        let insertStatus = []
        for (let i = 0; i < D.num.executer; i++) {
            let name = "" + ((i+1)*(i+1)) + "@vote-" + D.ID
            // let pass = "1024"
            let pass = crypto.randomBytes(4).toString('hex')
            let one = {
                vote: D.ID,
                name: name,
                role: "executer",
                pass: pass,
            }
            console.log(one)
            // insert executer to db::user
            insertStatus[i] = await DBUtil.put(db_user, name, one)
            exec[i] = name
        }
        D.executer = exec
        D.ticket = []
        D.ticketCount = 0

        let code = []

        code.push(insertStatus)
        code.push(await DBUtil.put(db_vote_list, count.value, D))
        code.push(await DBUtil.put(db_vote, "count", count))
        return code
    },
    getVoteList: async function(name){
        let db_user = DBUtil.root.user.db
        let db_vote = DBUtil.root.vote.db
        let db_vote_list = DBUtil.root.vote.list.db

        let count = await DBUtil.get(db_vote, "count")
        let user = await DBUtil.get(db_user, name)

        let voteList = []

        if (user.role=="admin") {
            for (let i = 1; i <= count.value; i++) {
            
                let one = await DBUtil.get(db_vote_list, i)
                voteList.push(one)
            }
        }else{
            let one = await DBUtil.get(db_vote_list, user.vote)
            voteList.push(one)
        }    

        return voteList
    },
    getVoteInfo: async function(D){
        let db_vote_list = DBUtil.root.vote.list.db
        let ID = parseInt(D.ID)
        let one = await DBUtil.get(db_vote_list, ID)
        return one
    },
    addParticipant: async function(D){
        let db_vote_list = DBUtil.root.vote.list.db
        let ID = parseInt(D.ID)
        let participant = D.participant
        let one = await DBUtil.get(db_vote_list, ID)

        one.participant = participant

        return await DBUtil.put(db_vote_list, ID, one)
    },
    addTicket: async function(D, name){
        let db_user = DBUtil.root.user.db
        let db_vote_list = DBUtil.root.vote.list.db

        let vote = await DBUtil.get(db_vote_list, D.ID)
        let user = await DBUtil.get(db_user, name)
        vote.ticketCount++

        if (user.role == "executer" && user.vote != D.ID) {
            console.log("ZZZZZZZZ")
            return {}
        }

        if (DBUtil.root.vote.detail[vote.ID]==undefined){
            DBUtil.root.vote.detail[vote.ID] = {}
            DBUtil.root.vote.detail[vote.ID].db = level('./LEVELDB/vote/detail/'+vote.ID)
        }

        let db_vote_detail_list = DBUtil.root.vote.detail[vote.ID].db
        let total = 0
        for (let i = 0; i < D.add.value.length; i++) {
            total += D.add.value[i]
        }

        let T = {
            ID: vote.ticketCount,
            voteID: vote.ID,
            executer: name,
            value: D.add.value,
            total: total,
        }

        vote.ticket.push({
            ID: vote.ticketCount,
            executer: name,
        })
        
        let code = {}
        code["executer"] = name
        code["ID"] = T.ID
        code["ticket"] = await DBUtil.put(db_vote_detail_list, T.ID, T)
        code["vote"] = await DBUtil.put(db_vote_list, vote.ID, vote)

        // console.log(code)

        return code
    },
    getTicketList: async function(D, name){
        let db_user = DBUtil.root.user.db
        let db_vote_list = DBUtil.root.vote.list.db

        let vote = await DBUtil.get(db_vote_list, D.ID)
        let user = await DBUtil.get(db_user, name)

        if (vote.ID==undefined) {
            return []
        }

        let ticketList = []
        
        if (DBUtil.root.vote.detail[vote.ID]==undefined){
            DBUtil.root.vote.detail[vote.ID] = {}
            DBUtil.root.vote.detail[vote.ID].db = level('./LEVELDB/vote/detail/'+vote.ID)
        }
        let db_vote_detail_list = DBUtil.root.vote.detail[vote.ID].db

        for (let i = 0; i < vote.ticket.length; i++) {
            let T = vote.ticket[i]
            if (T.executer==name || user.role=="admin") {
                let one = await DBUtil.get(db_vote_detail_list, T.ID)
                ticketList.push(one)
            }            
        }

        return ticketList
    },
}

module.exports = vote