var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;

var CommentDAO = {
    async SelectAll() {
        var query = {};
        var db = await client.getDB();
        var comments = await db.collection("comments").find(query).toArray();
        return comments;
    },
    async insert(comments) {
        var db = await client.getDB();
        var result = await db.collection("comments").insertOne(comments);
        return result.insertedCount > 0 ? true : false;
    },
    async update(comments) {
        var query = { _id: ObjectId(comments._id) };
        var newvalues = { $set: { name: comments.name } };
        var db = await client.getDB();
        var result = await db.collection("comments").updateOne(query, newvalues);
        return result.result.nModified > 0 ? true : false;
    }
}
module.exports = CommentDAO;