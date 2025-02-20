// filepath: /C:/Users/chuang/test/fileuploader/middleware/ensureAuth.js
module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};