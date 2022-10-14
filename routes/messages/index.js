const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const ConversationData = require("../../schema/messages/conversationdata");
const AdminData = require("../../schema/admin/admindata")

let responses = Object.create(null);

const jwtverifier = (req, res, next) => {
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
                const id = decode.id;

                if(id.includes("admin")){
                    AdminData.findOne({adminID: id}, (err, result) => {
                        if(err){
                            res.send({status: false, result:{
                                message: "Error checking account!"
                            }})
                        }
                        else{
                            if(id.includes("admin")){
                                if(result.adminID == id){
                                    req.params.decodedID = decode.id
                                    req.params.userType = "system_admin"
                                    next();
                                }
                                else{
                                    res.send({status: false, result:{
                                        message: "No Existing Account!"
                                    }})
                                }
                            }
                            else{
                                res.send({status: false, result:{
                                    message: "No Existing Account!"
                                }})
                            }
                        }
                    })
                }
                else{
                    //Add else if statements for other accounts such as Company Admin, Driver, Commuter
                    res.send({ status: false, result: { message: "Token not from System Admin" }})
                }
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

function dateGetter(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    return today = mm + '/' + dd + '/' + yyyy;
}

function timeGetter(){
    var today = new Date();
    var hour = String(today.getHours() % 12 || 12);
    var minutes = String(today.getMinutes() >= 9? today.getMinutes() : `0${today.getMinutes()}`)
    var seconds = String(today.getSeconds() >= 9? today.getSeconds() : `0${today.getSeconds()}`)
    var timeIndicator = hour >= 12? "am" : "pm"

    return today = `${hour}:${minutes}:${seconds} ${timeIndicator}`;
}

router.use((req, res, next) => {
    next();
})

router.get('/', (req, res) => {
    ConversationData.find({}, (err, result) => {
        if(err){
            res.send({ status: false, result: { messages: "Error in default messages route" } })
            console.log(err)
        }
        else{
            res.send({ status: true, result: { 
                messages: "Messages route and database running!" ,
                date: dateGetter(),
                time: timeGetter()
            } })
        }
    })
})

router.post('/sendMessage', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const userType = req.params.userType;

    /**
     * Note: 
     * 
     * Send message algorithm here
     * firstly check if conversation id is existing or not, and if not, create new,
     * make a new long polling service for messages (this applies for all users)
     */
    res.send({ status: true, result: {
        userID: id, 
        message: "JWT accepted Token!",
        userType: userType 
    } })
})

module.exports = router;

