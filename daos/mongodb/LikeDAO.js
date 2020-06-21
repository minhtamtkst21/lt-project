var client = require("../../utils/MongodbUtil.js");
const { check } = require("./RateDAO.js");
var ObjectId = require('mongodb').ObjectId;
var LikeDAO = {
  async selectAll() {
    var query = {};
    var db = await client.getDB();
    var rates = await db.collection("likes").find(query).toArray();
    return rates;
  },
  async check(cust, prod){
    var query = {'product._id': ObjectId(prod), customer: cust};
    var db = await client.getDB();
    var rate = await db.collection("likes").findOne(query);
    return rate;
  },
  async selectByProduct(_id){
    var query = {'product._id': ObjectId(_id)};
    var db = await client.getDB();
    var rates = await db.collection("likes").find(query).toArray();
    return rates;
  },
  async insert(rate) {
    var db = await client.getDB();
    var result = await db.collection("likes").insertOne(rate);
    return result.insertedCount > 0 ? true : false;
  },
  async delete(_id) {
    var db = await client.getDB();
    var query = {_id: ObjectId(_id)};
    var result = await db.collection("likes").deleteOne(query);
    return result.result.n > 0 ? true : false;
  }
};
module.exports = LikeDAO;