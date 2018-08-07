var express = require('express');
var router = express.Router();

/* authenticate user's login info */
router.post('/auth', function(req, res, next) {

  let user = req.params.username
  let pass = req.params.password

  // DB:: look for user
  // DB:: check user name
  // DB:: check user pass

  // SESSION:: set .user
  // SESSION:: set .cred
  // SESSION:: set .time
  // COOKIE::  set .cred

  // RESPONSE:: direct url
  let data = {
    ok: true,
    url: "index.html",
  }

  res.send(data);
});

module.exports = router;
