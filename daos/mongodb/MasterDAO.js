var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;
var MasterDAO = {
  async selectByUsernameAndPassword(username, password) {
    var query = { username: username, password: password };
    var db = await client.getDB();
    var master = await db.collection("masters").findOne(query);
    return master;
},
async update(admin) {
  var query = { _id: ObjectId(admin._id) };
  var newvalues = { $set: { username: admin.username, password: admin.password, permission: admin.permission } };
  var db = await client.getDB();
  var result = await db.collection("admins").updateOne(query, newvalues);
  return result.result.nModified > 0 ? true : false;
},
};
module.exports = MasterDAO;