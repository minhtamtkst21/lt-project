var express = require('express');
var router = express.Router();

var MyUtil = require("../utils/MyUtil.js");

var pathDAO = "../daos/mongodb";
var masterDAO = require(pathDAO + "/MasterDAO.js");
var AdminDAO = require(pathDAO + "/AdminDAO.js");

router.get(['/', '/home'], async function (req, res) {
    if (req.session.master) {
      var admins = await AdminDAO.selectAll();
      res.render('../views/master/home.ejs', { admin: admins });
    } else {
      res.redirect('./login');
    }
});
router.post('/addadmin', async function (req, res) {
  var username = req.body.txtName;
  var password = req.body.txtPass;
  var permission = req.body.txtPer;
  var admin = { username: username, password: password, permission: permission };
  var result = await AdminDAO.insert(admin);
  if (result) {
    MyUtil.showAlertAndRedirect(res, 'OK BABY!', './home');
  } else {
    MyUtil.showAlertAndRedirect(res, 'SORRY BABY!', './home');
  }
});
router.post('/resetadmin', async function (req, res) {
  var _id = req.body.txtID;
  var username = req.body.txtName;
  var permission = req.body.txtPer;
  var admin = { _id: _id, username: username, permission: permission};
  var result = await AdminDAO.reset(admin);
  if (result) {
    MyUtil.showAlertAndRedirect(res, 'OK BABY!', './home');
  } else {
    MyUtil.showAlertAndRedirect(res, 'SORRY BABY!', './home');
  }
});
router.post('/updateadmin', async function (req, res) {
  var _id = req.body.txtID;
  var username = req.body.txtName;
  var password = req.body.txtPass;
  var permission = req.body.txtPer;
  var admin = { _id: _id, username: username,password: password, permission: permission };
  var result = await masterDAO.update(admin);
  if (result) {
    MyUtil.showAlertAndRedirect(res, 'UPDATE ADMIN SUCCESSFULLY!', './home');
  } else {
    MyUtil.showAlertAndRedirect(res, 'UPDATE ADMIN FAILED!', './home');
  }
});
router.post('/deleteadmin', async function (req, res) {
  var _id = req.body.txtID;
  var result = await AdminDAO.delete(_id);
  if (result) {
    MyUtil.showAlertAndRedirect(res, 'OK BABY!', './home');
  } else {
    MyUtil.showAlertAndRedirect(res, 'SORRY BABY!', './home');
  }
});
// master
router.get('/login', function (req, res) {
    res.render('../views/master/login.ejs');
});
router.post('/login', async function (req, res) {
    var username = req.body.txtUsername;
    var password = req.body.txtPassword;
    var master = await masterDAO.selectByUsernameAndPassword(username, password);
    if (master) {
      req.session.master = master;
      res.redirect('./home');
    } else {
      MyUtil.showAlertAndRedirect(res, 'SORRY BABY!', './login');
    }
});
router.get('/logout', function (req, res) {
    delete req.session.master;
    res.redirect('./home');
});
module.exports = router;