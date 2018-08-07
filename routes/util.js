
let util = {
  checkCrendential: function (req, res, next){
    if(req.path.indexOf("login.html")!=-1){
        next()
        return
    }
    if (!req.cookies.cred ||
        !req.session.cred ||
        req.cookies.cred!=req.session.cred) {
          // redirect
          res.redirect('/login.html');
          return
    }else{
        next()
    }
  }
}

module.exports = util;
