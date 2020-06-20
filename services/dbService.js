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
        if (req.query.n && req.query.n != undefined) {
            let NumberOfAwards = parseInt(req.query.n);
            db.collection('authors').find({ awards: { $exists: true }, $where: 'this.awards.length>=' + NumberOfAwards }).toArray(function (err, authorDetails) {
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
        } else {
            res.send({ "status": "error", "message": "Params missing !!", "status_code": "NOPARAMS" });

        }

    },

    getAuthorsDetailsByYear: function (req, res) {
        if (req.query.y && req.query.y != undefined) {
            let year = parseInt(req.query.y);
            db.collection('authors').find({ awards: { $elemMatch: { year: { $gte: year } } } }).toArray(function (err, authorDetails) {
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
        } else {
            res.send({ "status": "error", "message": "Params missing !!", "status_code": "NOPARAMS" });

        }
    },

    getTotalBooksSoldByAuhors: function (req, res) {
        db.collection('authors').aggregate([
            {
                "$lookup": {
                    "from": "books",
                    "localField": "_id",
                    "foreignField": "authorId",
                    "as": "booksObjects"
                }
            },
            { "$unwind": "$booksObjects" },
            {
                "$group": {
                    "_id": "$booksObjects.authorId",
                    "totalBooksSold": { $sum: { $add: ["$booksObjects.sold"] } },
                    "totalProfit": {
                        $sum:
                            { $multiply: ["$booksObjects.price", "$booksObjects.sold"] }
                    },
                }
            }
        ]).toArray(function (err, authorDetails) {
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
        if (req.query.birthDate && req.query.birthDate != undefined && req.query.totalPrice && req.query.totalPrice != undefined) {
            let BirthDate = req.query.birthDate;
            let TotalPrice = parseInt(req.query.totalPrice);
            db.collection('authors').aggregate([
                { $match: { "birth": { $gte: new Date(BirthDate) } } },
                {
                    "$lookup": {
                        "from": "books",
                        "localField": "_id",
                        "foreignField": "authorId",
                        "as": "booksObjects"
                    }
                },
                { "$unwind": "$booksObjects" },
                {
                    "$group": {
                        "_id": "$booksObjects.authorId",
                        "totalPrice": {
                            $sum:
                                { $multiply: ["$booksObjects.price", "$booksObjects.sold"] }
                        },
                    }
                },
                {
                    $match: { "totalPrice": { $gte: TotalPrice } }
                }
            ]).toArray(function (err, authorDetails) {
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
        } else {
            res.send({ "status": "error", "message": "Params missing !!", "status_code": "NOPARAMS" });

        }

    },


}
