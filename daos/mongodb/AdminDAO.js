var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;
var AdminDAO = {
  async selectByUsernameAndPassword(username, password) {
    var query = { username: username, password: password };
    var db = await client.getDB();
    var admin = await db.collection("admins").findOne(query);
    return admin;
  },
  async selectAll() {
  var query = {};
  var db = await client.getDB();
  var admins = await db.collection("admins").find(query).toArray();
  return admins;
  },
  async insert(admin) {
    var db = await client.getDB();
    var result = await db.collection("admins").insertOne(admin);
    return result.insertedCount > 0 ? true : false;
  },
  async reset(admin) {
    var query = { _id: ObjectId(admin._id) };
    var newvalues = { $set: { password: "123" } };
    var db = await client.getDB();
    var result = await db.collection("admins").updateOne(query, newvalues);
    return result.result.nModified > 0 ? true : false;
  },
  async update(admin) {
    var query = { _id: ObjectId(admin._id) };
    var newvalues = { $set: { username: admin.username, password: admin.password } };
    var db = await client.getDB();
    var result = await db.collection("admins").updateOne(query, newvalues);
    return result.result.nModified > 0 ? true : false;
  },
  async delete(_id) {
    var query = { _id: ObjectId(_id) };
    var db = await client.getDB();
    var result = await db.collection("admins").deleteOne(query);
    return result.result.n > 0 ? true : false;
  }
}
module.exports = AdminDAO;