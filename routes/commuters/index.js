const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const UserProfilesData = require("../../schema/allusers/userprofiles")
const CommuterData = require("../../schema/commuters/commuterdata")

router.use((req, res, next) => {
    next();
})

router.get('/', (req, res) => {
    res.send("API Null!");
})

function makeid(length) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

const jwtverifiercommuter = (req, res, next) => {
    const token = req.headers["x-access-token"];

    //JWT must be transfered in headers later
    if(token != null && token != ""){
        jwt.verify(token, "qcbtsserver", (err, decode) => {
            if(err){
                res.send({status: false, result:{
                    message: "Token Error!"
                }})
            }
            else{
                const id = decode.userID;
                // console.log(id)

                CommuterData.findOne({userID: id}, (err, result) => {
                    if(err){
                        res.send({status: false, result:{
                            message: "Error checking account!"
                        }})
                    }
                    else{
                        if(result != null){
                            req.params.userID = result.userID,
                            req.params.username = result.username
                            next()
                            // console.log(result)
                        }
                        else{
                            res.send({status: false, result:{
                                message: "Error checking token"
                            }})
                        }
                    }
                })
            }
        })
    }
    else{
        res.send({status: false, result:{
            message: "No Token Received!"
        }})
    }
    // jwt.verify()
}

router.get('/userinfo', jwtverifiercommuter, (req, res) => {
    const userID = req.params.userID;

    CommuterData.findOne({ userID: userID }, (err, result) => {
        if(err){
            console.log(err)
            res.send({ status: false, message: "Error fetching profile" })
        }
        else{
            // console.log(result);

            res.send({ status: true, result: result })
        }
    })
})

module.exports = router;