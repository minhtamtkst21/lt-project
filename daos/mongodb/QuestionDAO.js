var client = require("../../utils/MongodbUtil.js");
var ObjectId = require('mongodb').ObjectId;

var QuestionDAO = {
    async SelectAll() {
        var query = {};
        var db = await client.getDB();
        var questions = await db.collection("questions").find(query).toArray();
        return questions;
    },
    async insertQ(questions) {
        var db = await client.getDB();
        var result = await db.collection("questions").insertOne(questions);
        return result.insertedCount > 0 ? true : false;
    },
    async insertA(questions) {
        var query = { _id: ObjectId(questions._id) };
        var newvalues = { $set: { answer: questions.answer} };
        var db = await client.getDB();
        var result = await db.collection("questions").updateOne(query, newvalues);
        return result.result.nModified > 0 ? true : false;
    },
    async update(questions) {
        var query = { _id: ObjectId(questions._id) };
        var newvalues = { $set: { name: questions.name} };
        var db = await client.getDB();
        var result = await db.collection("questions").updateOne(query, newvalues);
        return result.result.nModified > 0 ? true : false;
    }
}
module.exports = QuestionDAO;