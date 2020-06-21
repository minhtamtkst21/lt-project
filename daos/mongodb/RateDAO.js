var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;
var RateDAO = {
  async selectAll() {
    var query = {};
    var db = await client.getDB();
    var rates = await db.collection("rates").find(query).toArray();
    return rates;
  },
  async selectByCustomerAndProduct(cust, prod){
    var query = {'product._id': ObjectId(prod), customer: cust};
    var db = await client.getDB();
    var rate = await db.collection("rates").findOne(query);
    return rate;
  },
  async selectByProduct(_id){
    var query = {'product._id': ObjectId(_id)};
    var db = await client.getDB();
    var rates = await db.collection("rates").find(query).toArray();
    return rates;
  },
  async insert(rate) {
    var db = await client.getDB();
    var result = await db.collection("rates").insertOne(rate);
    return result.insertedCount > 0 ? true : false;
  },
  async update(_id, rate) {
    var query = { _id: ObjectId(_id) };
    var newvalues = { $set: { rate: rate } };
    var db = await client.getDB();
    var result = await db.collection("rates").updateOne(query, newvalues);
    return result.result.nModified > 0 ? true : false;
  },
  async check(custId, prodId){
    var query = { 'customer._id': custId,'product._id': ObjectId(prodId) };
    var db = await client.getDB();
    var rates = await db.collection("rates").find(query).toArray();
    if (rates.length > 0){
      return true;
    }
    return false;
  }
};
module.exports = RateDAO;