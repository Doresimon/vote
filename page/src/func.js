const func = {
  jump(target) {
    location.href = target;
  },
  jumpNew(target) {
    window.open(target);
  },
  getParam(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = location.search.substr(1).match(reg);
    let context = "";
    if (r != null) context = r[2];
    reg = null;
    r = null;
    return context == null || context == "" || context == "undefined"
      ? ""
      : context;
  },
  getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) == 0) {
        return unescape(c.substring(name.length, c.length));
      }
    }
    return null;
  }
};

export default func;
