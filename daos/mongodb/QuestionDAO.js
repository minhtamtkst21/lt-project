var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;

var CommentDAO = {
    async SelectAll() {
        var query = {};
        var db = await client.getDB();
        var comments = await db.collection("questions").find(query).toArray();
        return comments;
    },
    async selectByID(_id) {
        var query = { _id: ObjectId(_id) };
        var db = await client.getDB();
        var comments = await db.collection("questions").findOne(query);
        return comments;
    },
    async selectByProdID(_pid) {
        var query = { 'product._id': ObjectId(_pid) };
        var db = await client.getDB();
        var comments = await db.collection("questions").find(query).toArray();
        return comments;
    },
    async selectByAdminname(admin) {
        var query = { 'product.admin': admin };
        var db = await client.getDB();
        var comments = await db.collection("questions").find(query).toArray();
        return comments;
    },
    async insert(comments) {
        var db = await client.getDB();
        var result = await db.collection("questions").insertOne(comments);
        return result.insertedCount > 0 ? true : false;
    },
    async update(_id, question) {
        var query = { _id: ObjectId(_id) };
        var newvalues = { $set: { question: question } };
        var db = await client.getDB();
        var result = await db.collection("questions").updateOne(query, newvalues);
        return result.result.nModified > 0 ? true : false;
    },
    async answer(_id, answer){
        var query = { _id: ObjectId(_id) };
        var newvalues = { $set: { answer: answer } };
        var db = await client.getDB();
        var result = await db.collection("questions").updateOne(query, newvalues);
        return result.result.nModified > 0 ? true : false;
    },
    async delete(_id) {
        var query = { _id: ObjectId(_id) };
        var db = await client.getDB();
        var result = await db.collection("questions").deleteOne(query);
        return result.result.n > 0 ? true : false;
      }
}
module.exports = CommentDAO;