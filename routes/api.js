var express = require('express');
var router = express.Router();

let level = require('level');
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
    res.cookie('cred', c, { maxAge: 0.1*hour });
    req.session.name = name;
    res.cookie('name', name, { maxAge: 0.1*hour });
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

  switch (method) {
    case "addVote":
      await VoteUtil.addVote(D)
      res.send(R);
      break;
    case "getVoteList":
      R.voteList = await VoteUtil.getVoteList()
      console.log("SEND!!!!!")
      res.send(R);
      break;
  
    default:
      res.send("hello???");
      break;
  }
  
});

module.exports = router;
