const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const UserProfilesData = require("../../schema/allusers/userprofiles")
const CommuterData = require("../../schema/commuters/commuterdata")
const BusStopsData = require("../../schema/configs/busstops")
const RoutesData = require("../../schema/configs/routes")

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

router.post('/editcommutername', jwtverifiercommuter, (req, res) => {
    const userID = req.params.userID;
    const name = req.body.name

    CommuterData.updateOne({ userID: userID }, { name: name }, (err, result) => {
        if(err){
            console.log(err)
            req.send({ status: false, message: "Cannot update details" })
        }
        else{
            res.send({ status: true, message: "Name has been updated" })
        }
    })
})

router.post('/editcommuteremail', jwtverifiercommuter, (req, res) => {
    const userID = req.params.userID;
    const email = req.body.email
    const password = req.body.password

    CommuterData.updateOne({ userID: userID, password: password }, { email: email }, (err, result) => {
        if(err){
            console.log(err)
            req.send({ status: false, message: "Cannot update details" })
        }
        else{
            // console.log(result)
            if(result.modifiedCount > 0){
                res.send({ status: true, message: "Email has been updated" })
            }
            else{
                res.send({ status: false, message: "Password is incorrect" })
            }
        }
    })
})

router.post('/editcommutercontactnumber', jwtverifiercommuter, (req, res) => {
    const userID = req.params.userID;
    const contactnumber = req.body.contactnumber
    const password = req.body.password

    CommuterData.updateOne({ userID: userID, password: password }, { contactnumber: contactnumber }, (err, result) => {
        if(err){
            console.log(err)
            req.send({ status: false, message: "Cannot update details" })
        }
        else{
            // console.log(result)
            if(result.modifiedCount > 0){
                res.send({ status: true, message: "Contact Number has been updated" })
            }
            else{
                res.send({ status: false, message: "Password is incorrect" })
            }
        }
    })
})

router.post('/editcommuterpassword', jwtverifiercommuter, (req, res) => {
    const userID = req.params.userID;
    const newpassword = req.body.newpassword
    const password = req.body.password

    CommuterData.updateOne({ userID: userID, password: password }, { password: newpassword }, (err, result) => {
        if(err){
            console.log(err)
            req.send({ status: false, message: "Cannot update details" })
        }
        else{
            // console.log(result)
            if(result.modifiedCount > 0){
                res.send({ status: true, message: "Password has been updated" })
            }
            else{
                res.send({ status: false, message: "Current Password is incorrect" })
            }
        }
    })
})

router.get('/enabledBusStops', jwtverifiercommuter, (req, res) => {
    BusStopsData.find({status: true}, (err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Cannot fetch Bus Stops" } })
            console.log(err)
        }
        else{
            res.send({ status: true, result: result })
            // console.log(result)
        }
    })
})

router.get('/publicroutes', jwtverifiercommuter, (req, res) => {
    RoutesData.find({ privacy: false }, (err, result) => {
        if(err){
            console.log(err)
            res.send({ status: false, message: "Unable to retrieve routes" })
        }
        else{
            res.send({ status: true, result: result })
        }
    })
})

module.exports = router;