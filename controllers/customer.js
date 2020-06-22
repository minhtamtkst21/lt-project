var express = require('express');
var router = express.Router();
// utils
var MyUtil = require("../utils/MyUtil.js");
var EmailUtil = require("../utils/EmailUtil.js");
// daos
var pathDAO = "../daos/mongodb";
//var pathDAO = "../daos/mongoose";
var CategoryDAO = require(pathDAO + "/CategoryDAO.js");
var ProductDAO = require(pathDAO + "/ProductDAO.js");
var CustomerDAO = require(pathDAO + "/CustomerDAO.js");
var OrderDAO = require(pathDAO + "/OrderDAO.js");
var AdminDAO = require(pathDAO + "/AdminDAO.js");
var CommentDAO = require(pathDAO + "/CommentDAO.js");
var QuestionDAO = require(pathDAO + "/QuestionDAO.js");
var RateDAO = require(pathDAO + "/RateDAO.js");
var LikeDAO = require(pathDAO + "/LikeDAO.js");
// routes
router.get(['/', '/home'], async function (req, res) {
  var categories = await CategoryDAO.selectAll();
  var newproducts = await ProductDAO.selectTopNew(3);
  var hotproducts = await ProductDAO.selectTopHot(3);
  res.render('../views/customer/home.ejs', { cats: categories, newprods: newproducts, hotprods: hotproducts });
});
// product
router.get('/listproduct', async function (req, res) {
  var categories = await CategoryDAO.selectAll();
  var _cid = req.query.catID; // /listproduct?catID=XXX
  var products = await ProductDAO.selectByCatID(_cid);
  res.render('../views/customer/listproduct.ejs', { cats: categories, prods: products });
});
router.post('/search', async function (req, res) {
  var categories = await CategoryDAO.selectAll();
  var keyword = req.body.txtKeyword;
  var products = await ProductDAO.selectByKeyword(keyword);
  res.render('../views/customer/listproduct.ejs', { cats: categories, prods: products });
});
router.get('/details', async function (req, res) {
  var categories = await CategoryDAO.selectAll();
  var _id = req.query.id; // /details?id=XXX
  var product = await ProductDAO.selectByID(_id); 
  var comment = await CommentDAO.selectByProdID(_id);
  var question = await QuestionDAO.selectByProdID(_id);
  var rates = await RateDAO.selectByProduct(_id);
  var rating = 0;
  var checkbuyproduct = false;
  var checkrating = false;
  var checklike = false;
  var crate = null;
  var clike = null;
  var like = await LikeDAO.selectByProduct(_id);
  var countlike = like.length;
  if (rates.length > 0) { 
  for (var i of rates) {
    rating = rating + i.rate;
  }
    rating = (rating / rates.length).toFixed(1);
  }
  if (req.session.customer){
    var cust = req.session.customer.username;
    checkbuyproduct = await OrderDAO.check(req.session.customer._id, _id);
    for (var i of rates) {
      if (i.customer === req.session.customer._id) {
      crate = i;
      checkrating = true;
      break;
      }
    }
    clike = await LikeDAO.check(req.session.customer._id, _id);
    if (clike != null) {
      checklike = true;
    }
  }
  res.render('../views/customer/details.ejs', {
    prod: product, 
    cats: categories, 
    comments: comment, 
    questions: question, 
    checkbuyproduct: checkbuyproduct,
    cust: cust,
    crate: crate,
    rating: rating,
    clike: clike,
    countlike: countlike,
    checkrating: checkrating,
    checklike: checklike
  });
});
// customer
router.get('/signup', async function (req, res) {
  var categories = await CategoryDAO.selectAll();
  res.render('../views/customer/signup.ejs', {cats: categories});
});
router.post('/signup', async function (req, res) {
  var username = req.body.txtUsername;
  var password = req.body.txtPassword;
  var name = req.body.txtName;
  var phone = req.body.txtPhone;
  var email = req.body.txtEmail;
  var dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);
  if (dbCust) {
    MyUtil.showAlertAndRedirect(res, 'EXISTS USERNAME OR EMAIL!', './signup');
  } else {
    var now = new Date().getTime(); // milliseconds
    var token = MyUtil.md5(now.toString());
    var newCust = { username: username, password: password, name: name, phone: phone, email: email, active: 0, token: token };
    var newID = await CustomerDAO.insert(newCust);
    if (newID) {
      var result = await EmailUtil.send(email, newID, token);
      if (result) {
        MyUtil.showAlertAndRedirect(res, 'CHECK EMAIL!', './login');
      } else {
        MyUtil.showAlertAndRedirect(res, 'EMAIL FAILURE!', './signup');
      }
    } else {
      MyUtil.showAlertAndRedirect(res, 'INSERT FAILURE!', './signup');
    }
  }
});
router.get('/verify', async function (req, res) {
  var _id = req.query.id; // /verify?id=XXX&token=XXX
  var token = req.query.token;
  var result = await CustomerDAO.active(_id, token, 1);
  if (result) {
    MyUtil.showAlertAndRedirect(res, 'VERIFY SUCCESSFULLY!', './login');
  } else {
    MyUtil.showAlertAndRedirect(res, 'VERIFY FAILED!', './signup');
  }
});
router.get('/login', async function (req, res) {
  var categories = await CategoryDAO.selectAll();
  res.render('../views/customer/login.ejs', {cats: categories});
});
router.post('/login', async function (req, res) {
  var username = req.body.txtUsername;
  var password = req.body.txtPassword;
  var customer = await CustomerDAO.selectByUsernameAndPassword(username, password);
  if (customer && customer.active == 1) {
    req.session.customer = customer;
    res.redirect('./home');
  } else {
    MyUtil.showAlertAndRedirect(res, 'LOGIN FAILED!', './login');
  }
});
router.get('/logout', function (req, res) {
  delete req.session.customer;
  res.redirect('./home');
});
// myprofile
router.get('/myprofile', async function (req, res) {
  var categories = await CategoryDAO.selectAll();
  res.render('../views/customer/myprofile.ejs',{cats: categories});
});
router.post('/myprofile', async function (req, res) {
  var curCust = req.session.customer;
  if (curCust) {
    var username = req.body.txtUsername;
    var password = req.body.txtPassword;
    var name = req.body.txtName;
    var phone = req.body.txtPhone;
    var email = req.body.txtEmail;
    var newCust = { _id: curCust._id, username: username, password: password, name: name, phone: phone, email: email, active: curCust.active, token: curCust.token };
    var result = await CustomerDAO.update(newCust);
    if (result) {
      req.session.customer = newCust;
      MyUtil.showAlertAndRedirect(res, 'UPDATE SUCCESSFULLY!', './home');
    }
  }
  MyUtil.showAlertAndRedirect(res, 'UPDATE FAILED', './myprofile');
});
// myorders
router.get('/myorders', async function (req, res) {
  var categories = await CategoryDAO.selectAll();
  var cust = req.session.customer;
  if (cust) {
    var orders = await OrderDAO.selectByCustID(cust._id);
    var _id = req.query.id; // /myorders?id=XXX
    if (_id) {
      var order = await OrderDAO.selectByID(_id);
    }
    res.render('../views/customer/myorders.ejs', { orders: orders, order: order, cats: categories });
  } else {
    res.redirect('./home');
  }
});
// mycart
router.get('/mycart', async function (req, res) {
  var categories = await CategoryDAO.selectAll();
  if (req.session.mycart && req.session.mycart.length > 0) {
    var total = MyUtil.getTotal(req.session.mycart);
    res.render('../views/customer/mycart.ejs', { total: total, cates: categories });
  } else {
    MyUtil.showAlertAndRedirect(res, 'NO PRODUCT IN CART', './home');
  }
});
router.post('/add2cart', async function (req, res) {
  var _id = req.body.txtID;
  var quantity = parseInt(req.body.txtQuantity);
  var product = await ProductDAO.selectByID(_id);
  // create empty cart if not exists in the session, otherwise get out mycart from the session
  var mycart = [];
  if (req.session.mycart) mycart = req.session.mycart;
  var index = mycart.findIndex(x => x.product._id == _id); // check if the _id exists in mycart
  if (index == -1) { // not found, push newItem
    var newItem = { product: product, quantity: quantity };
    mycart.push(newItem);
  } else { // increasing the quantity
    mycart[index].quantity += quantity;
  }
  req.session.mycart = mycart; // put mycart back into the session
  //console.log(req.session.mycart); // for DBUG
  res.redirect('../details/?id='+_id);
});
router.get('/remove2cart', function (req, res) {
  if (req.session.mycart) {
    var mycart = req.session.mycart;
    var _id = req.query.id; // /remove2cart?id=XXX
    var index = mycart.findIndex(x => x.product._id == _id);
    if (index != -1) { // found, remove item
      mycart.splice(index, 1);
      req.session.mycart = mycart;
    }
  }
  res.redirect('./mycart');
});
router.get('/checkout', async function (req, res) {
  if (req.session.customer) {
    var now = new Date().getTime(); // milliseconds
    var total = MyUtil.getTotal(req.session.mycart);
    var order = { cdate: now, total: total, status: 'PENDING', customer: req.session.customer, items: req.session.mycart };
    var result = await OrderDAO.insert(order);
    if (result) {
      delete req.session.mycart;
      MyUtil.showAlertAndRedirect(res, 'CHECKOUT SUCCESSFULLY!', './home');
    } else {
      MyUtil.showAlertAndRedirect(res, 'CHECKOUT FAILED!', './mycart');
    }
  } else {
    res.redirect('./login');
  }
});
router.get('/becomeadmin', async function (req,res) {
  var admin = req.session.customer;
  var username = admin.username;
  var password = admin.password;
  var permission = "-1";
  var admin = { username: username, password: password, permission: permission };
  var result = await AdminDAO.insert(admin);
  if (result) {
    MyUtil.showAlertAndRedirect(res, 'please wait!', './myprofile');
  } else {
    MyUtil.showAlertAndRedirect(res, 'FAILED!', './myprofile');
  }
});
// comments
router.post('/addcomment', async function (req,res){
  if (req.session.customer){
    var _id = req.query.id; // /details?id=XXX
    var product = await ProductDAO.selectByID(_id);
    var customer = req.session.customer.username;
    var comment = req.body.txtComments;
    var reply = "";
    var comments = {comment: comment, product: product, customer: customer, reply: reply};
    var result = await CommentDAO.insert(comments);
      res.redirect('../details/?id='+req.query.id);
  } else{
    MyUtil.showAlertAndRedirect(res, 'PLEASE LOGIN', '../login');
  }
});
router.post('/editcomment', async function (req, res){
  if (req.session.customer){
    var _id = req.query.id;
    var comment = req.body.txtComment;
    var comments = await CommentDAO.selectByID(_id);
    var result = await CommentDAO.update(_id, comment);
      res.redirect('../details/?id='+comments.product._id);
  } else{
    MyUtil.showAlertAndRedirect(res, 'PLEASE LOGIN', '../login');
  }
});
router.post('/deletecomment', async function (req,res){
  if (req.session.customer){
  var _id = req.query.id;
  var comments = await CommentDAO.selectByID(_id);
  var result = await CommentDAO.delete(_id);
  res.redirect('../details/?id='+comments.product._id);
  } else{
    MyUtil.showAlertAndRedirect(res, 'PLEASE LOGIN', '../login');
  }
});
// questions
router.post('/addquestion', async function (req,res){
  if (req.session.customer){
    var _id = req.query.id; // /details?id=XXX
    var product = await ProductDAO.selectByID(_id);
    var customer = req.session.customer.username;
    var question = req.body.txtQuestions;
    var answer = "";
    var questions = {question: question, product: product, customer: customer, answer: answer};
    var result = await QuestionDAO.insert(questions);
    res.redirect('../details/?id='+req.query.id);
  } else{
    MyUtil.showAlertAndRedirect(res, 'PLEASE LOGIN', '../login');
  }
});
router.post('/editquestion', async function (req, res){
  if (req.session.customer){
    var _id = req.query.id;
    var question = req.body.txtQuestion;
    var questions = await QuestionDAO.selectByID(_id);
    var result = await QuestionDAO.update(_id, question);
    res.redirect('../details/?id='+questions.product._id);
  } else{
    MyUtil.showAlertAndRedirect(res, 'PLEASE LOGIN', '../login');
  }
});
router.post('/deletequestion', async function (req,res){
  if (req.session.customer){
  var _id = req.query.id;
  var question = await QuestionDAO.selectByID(_id);
  var result = await QuestionDAO.delete(_id);
    res.redirect('../details/?id=' + question.product._id);
  } else{
    MyUtil.showAlertAndRedirect(res, 'PLEASE LOGIN', '../login');
  }
});
// ratings
router.post('/rating', async function (req, res){
  if (req.session.customer){
    var _id = req.query.id; // /details?id=XXX
    var product = await ProductDAO.selectByID(_id);
    var customer = req.session.customer._id;
    var rating = parseInt(req.body.txtRating);
    var rate = {product: product, customer: customer, rate: rating};
    var result = await RateDAO.insert(rate);
    res.redirect('../details/?id='+req.query.id);
  } else{
    MyUtil.showAlertAndRedirect(res, 'PLEASE LOGIN', '../login');
  }
});
router.post('/updaterating', async function (req, res){
  if (req.session.customer){
    var _id = req.query.id;
    var rating = req.body.txtRating;
    var rateid = req.body.txtRateId;
    var result = await RateDAO.update(rateid, rating);
    res.redirect('../details/?id='+_id);
  } else{
    MyUtil.showAlertAndRedirect(res, 'PLEASE LOGIN', '../login');
  }
});
// like
router.post('/like', async function (req, res){
  if (req.session.customer){
    var _id = req.query.id; // /details?id=XXX
    var product = await ProductDAO.selectByID(_id);
    var customer = req.session.customer._id;
    var like = {product: product, customer: customer};
    var result = await LikeDAO.insert(like);
    res.redirect('../details/?id='+_id);
  } else{
    MyUtil.showAlertAndRedirect(res, 'PLEASE LOGIN', '../login');
  }
});
router.post('/unlike', async function (req, res){
  if (req.session.customer){
    var _id = req.query.id;
    var like = req.body.txtLikeId;
    var result = await LikeDAO.delete(like);
      res.redirect('../details/?id=' + _id);
    } else{
      MyUtil.showAlertAndRedirect(res, 'PLEASE LOGIN', '../login');
    }
});
module.exports = router;