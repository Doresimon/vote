var express = require('express');
var router = express.Router();

let crypto = require('crypto');
let DBUtil = require('../module/leveldb');
let VoteUtil = require('../module/vote');

const hour = 60*60*1000
let lastPost = {}

/* authenticate user's login info */
router.post('/auth', async function(req, res, next) {
  let name = req.body.name
  let pass = req.body.pass
  let db = DBUtil.root.user.db
  
  let data = {
    ok: true,
    url: "dashboard.html",
  }
  
  // DB:: look for user
  let user = await DBUtil.get(db, name)

  if (user!={} && user.pass==pass) {
    let c = crypto.randomBytes(256).toString('hex')
    req.session.cred = c;
    req.session.name = name;
    req.session.role = user.role;
    console.log(user.role)

    
    res.cookie('cred', c, { maxAge: 24*hour });
    res.cookie('name', name, { maxAge: 24*hour });
    res.cookie('role', user.role, { maxAge: 24*hour });

    if (user.role=="executer") {
      data.url = "voteExecute.html?voteID="+user.vote
    }
  }else{
    data.ok = false
  }

  res.send(data);
});

/* vote method */
router.post('/vote/:method', async function(req, res, next) {
  let method = req.params.method
  let D = req.body
  let R = {}

  let username = req.session.name
  if (username==undefined){
    console.log(method,"no user")
    res.status(400).send("hello???");
    return
  }

  switch (method) {
    case "addVote":
      R.code = await VoteUtil.addVote(D)
      break;
    case "addParticipant":
      R.code = await VoteUtil.addParticipant(D)
      break;
    case "addTicket":
      // forbid double post
      let now = (new Date()).getTime()
      if (lastPost[username]!=undefined && (now - lastPost[username]) < 1000) {
        R.code = "blocked"
      }else{
        lastPost[username] = now
        R.code = await VoteUtil.addTicket(D, username)
      }
      break;
    case "removeTicket":
      R.code = await VoteUtil.removeTicket(D, username)
      break;
    case "getVoteList":
      R.voteList = await VoteUtil.getVoteList(username)
      break;
    case "getVoteInfo":
      R.vote = await VoteUtil.getVoteInfo(D)
      break;
    case "getTicketList":
      R.ticketList = await VoteUtil.getTicketList(D, username)
      break;
  
    default:
      R = "hello???"
      break;
  }
  
  res.send(R);
  
});

module.exports = router;
