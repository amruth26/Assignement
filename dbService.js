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
        db.collection('Authors').find({ "awards": { $gte: NumberOfAwards } }).toArray(function (err, authorDetails) {
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
        db.collection('Authors').find({ "year": { $gte: year } }).toArray(function (err, authorDetails) {
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
        db.collection('Authors').aggregate([{
            "$group": {
                _id: "$name",
                "totalBooksSold": { $sum: { $add: ["$awards"] } },
                "totalProfit": {
                    $sum:
                        { $multiply: ["$price", "$awards"] }
                },
            }
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

    getHighestProfitByAuhorsBirthdate: function (req, res) {
        let birthDate =  req.query.birthDate;
        let totalPrice = req.query.totalPrice;
        db.collection('Authors').aggregate([
            { $match: { "birthdate": { $gt: birthDate } } },
            {
                "$group": {
                    _id: "$name",
                    "totalPrice": {
                        $sum:
                            { $multiply: ["$price", "$awards"] }
                    },

                }
            },
            {
                $match: {
                    "totalPrice": {
                        $gte: totalPrice
                    }
                }
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








