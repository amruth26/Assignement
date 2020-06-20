"use strict";
var async = require("async");
var connection = require('./../services/mongoDB');
const { query } = require("express");
var ConnectToDatabase = async function () {
    try {
        (
            db = await connection.GetConnection());
    } catch (e) {
        console.error("unable to connect to databases ", e);
        //TODO: SENDING EMAIL ON MONGO ERROR  
        setTimeout(() => {
            ConnectToDatabase();
        }, 1000)
    }
}
ConnectToDatabase();

module.exports = {

    getAuthorsDetailsByAwards: function (req, res) {
        let NumberOfAwards = parseInt(req.query.n);
        db.collection('authors').find({awards : {$exists:true}, $where:'this.awards.length>=' + NumberOfAwards} ).toArray(function (err, authorDetails) {
            if (err) {
                console.log(err)
                res.send({ "status": "error", "message": "Error while gettig authors list", "status_code": "DBERR" });
            }
            else if (authorDetails && authorDetails.length > 0) {
                res.send({ "status": "success", "message": "successfully  got Authors list", "data": { "Authors": authorDetails }, "status_code": "SUCCESS" });

            }
            else {
                res.send({ "status": "error", "message": "No Authors Found !!", "status_code": "NOAUTHORS" });
            }
        });
    },

    getAuthorsDetailsByYear: function (req, res) {
        let year = parseInt(req.query.y);
        db.collection('authors').find({ awards: { $elemMatch: { year: {$gte : year }} } }).toArray(function (err, authorDetails) {
            if (err) {
                res.send({ "status": "error", "message": "Error while gettig authors list", "status_code": "DBERR" });
            }
            else if (authorDetails && authorDetails.length > 0) {
                res.send({ "status": "success", "message": "successfully  got Authors list", "data": { "Authors": authorDetails }, "status_code": "SUCCESS" });

            }
            else {
                res.send({ "status": "error", "message": "No Authors Found !!", "status_code": "NOAUTHORS" });
            }
        });
    },

    getTotalBooksSoldByAuhors: function (req, res) {
        db.collection('authors').aggregate([
         { "$lookup": {
       "from": "books",
       "localField": "_id",
       "foreignField": "authorId",
       "as": "booksObjects"
    }},
    { "$unwind": "$booksObjects" },
    { "$group": {
        "_id": "$booksObjects.authorId",
        "totalBooksSold": { $sum: { $add: ["$booksObjects.sold"] } },
                "totalProfit": {
                    $sum:
                        { $multiply: ["$booksObjects.price", "$booksObjects.sold"] }
                }, }
    }}
  }]).toArray(function (err, authorDetails) {
            console.log(usersDetails)
            if (err) {
                res.send({ "status": "error", "message": "Error while gettig authors list", "status_code": "DBERR" });
            }
            else if (authorDetails && authorDetails.length > 0) {
                res.send({ "status": "success", "message": "successfully  got Authors list", "data": { "Authors": authorDetails }, "status_code": "SUCCESS" });

            }
            else {
                res.send({ "status": "error", "message": "No Authors Found !!", "status_code": "NOAUTHORS" });
            }
        });

    },

    getHighestProfitByAuhorsBirthdate: function (req, res) {
        let birthDate =  req.query.birthDate;
        let totalPrice = req.query.totalPrice;
        db.collection('authors').aggregate([
            { $match: {  "birth": { $lt: new Date(birthDate)} } },
         { "$lookup": {
       "from": "books",
       "localField": "_id",
       "foreignField": "authorId",
       "as": "booksObjects"
    }},
    { "$unwind": "$booksObjects" },
    { "$group": {
        "_id": "$booksObjects.authorId",
        "totalPrice": 
        {
                        $sum:
                            { $multiply: ["$booksObjects.price", "$booksObjects.sold"] }
                    },
    }},
    {
     $match:  {"totalPrice" : {$gte : totalPrice} }   
    }
        ]).toArray(function (err, authorDetails) {
            console.log(usersDetails)
            if (err) {
                res.send({ "status": "error", "message": "Error while gettig authors list", "status_code": "DBERR" });
            }
            else if (authorDetails && authorDetails.length > 0) {
                res.send({ "status": "success", "message": "successfully  got Authors list", "data": { "Authors": authorDetails }, "status_code": "SUCCESS" });

            }
            else {
                res.send({ "status": "error", "message": "No Authors Found !!", "status_code": "NOAUTHORS" });
            }
        });

    },
}








