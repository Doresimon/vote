var express = require('express');
var router = express.Router();

let crypto = require('crypto');
let DBUtil = require('../module/leveldb');
let VoteUtil = require('../module/vote');

const hour = 60*60*1000

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
    res.cookie('cred', c, { maxAge: 24*hour });
    req.session.name = name;
    res.cookie('name', name, { maxAge: 24*hour });

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

  // let username = "boss"
  // let username = "1@vote-1"
  // let username = "4@vote-1"
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
      console.log(D)
      R.code = await VoteUtil.addTicket(D, username)
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
  
  console.log(method + "!!!!!")
  res.send(R);
  
});

module.exports = router;
