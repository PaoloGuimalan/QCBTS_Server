const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const ConversationData = require("../../schema/messages/conversationdata");
const AdminData = require("../../schema/admin/admindata")
const UserProfilesData = require("../../schema/allusers/userprofiles")

let responses = Object.create(null);
let responsesConvo = Object.create(null);
let responsesAlert = Object.create(null);

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
                                    req.params.userType = "systemadmins"
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

    
    const conversationID = req.body.conversationID;
    const contentID = `${makeid(20)}`;
    const content = req.body.content;
    const contentType = req.body.contentType;
    const contentTime = `${timeGetter()}`;
    const contentDate = `${dateGetter()}`;
    // const fromID = req.body.fromID;
    // const fromType = req.body.fromType;
    const toID = req.body.toID;
    const toType = req.body.toType;
    const filterType = req.body.filterType

    const numID = 00000000000000000000;

    const makeContentID = (cID) => {
        ConversationData.count({}, (err, result) => {
            if(err){
                res.send({ status: false, result: { message: "Error creating content ID" } })
                console.log(err);
            }
            else{
                // console.log(result + 1)
                const newContent = new ConversationData({
                    conversationID: conversationID,
                    contentID: result + 1,
                    content: content,
                    contentType: contentType,
                    contentTime: contentTime,
                    contentDate: contentDate,
                    from: {
                        userID: id,
                        userType: userType
                    },
                    to: {
                        userID: toID,
                        userType: toType
                    }
                })

                newContent.save().then(() => {
                    res.send({ status: true, result: { message: "Message Sent!" } })
                    respondToAllMsgData(id, toID, conversationID, filterType)
                    // console.log("Good")
                }).catch((err) => {
                    res.send({ status: false, result: { message: "Unable to send message!" } })
                    console.log(err)
                })
            }
        })
    }

    makeContentID(contentID)

    /**
     * Note: 
     * 
     * Send message algorithm here
     * firstly check if conversation id is existing or not, and if not, create new,
     * make a new long polling service for messages (this applies for all users)
     * 20 digits contentID
     * 15 digits conversationID
     */
})

router.get('/initMessagesList/:filterType/:filterTypeDynamic', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const filterType =  req.params.filterType;
    const filterTypeDynamic = req.params.filterTypeDynamic

    const generateProfilewithMessage = (arrayData, convResult) => {
        UserProfilesData.find({ userID: { $in: arrayData } }, (err, result) => {
            if(err){
                res.send({ status: false, result: { message: "Error generating Messages and Profiles" } })
                console.log(err)
            }
            else{
                res.send({ status: true, result: {
                    profiles: result.reverse(),
                    conversations: convResult
                } })
                // console.log({ status: true, result: {
                //     profiles: result,
                //     conversations: convResult
                // } })
                // console.log(result)
            }
        })
    }

    ConversationData.aggregate([
        {$match: {$or: [
            {$and: [
                {"from.userType": filterType},
                {"to.userType": filterTypeDynamic},
                {$or: [
                    {"from.userID": id},
                    {"to.userID": id}
                ]}
            ]},
            {$and: [
                {"to.userType": filterType},
                {"from.userType": filterTypeDynamic},
                {$or: [
                    {"from.userID": id},
                    {"to.userID": id}
                ]}
            ]}
        ]}},
        {$group: {
            _id: "$conversationID",
            conversationID: { $last: "$conversationID" },
            contentID: { $last: "$contentID" },
            content: { $last: "$content" },
            contentType: { $last: "$contentType" },
            contentTime: { $last: "$contentTime" },
            contentDate: { $last: "$contentDate" },
            from: { $last: "$from" },
            to: { $last: "$to" }
        }},
        // {$match: {$or: [{$or: [{"from.userType": filterType},{"from.userID": id}]},{$or: [{"to.userType": filterType},{"to.userID": id}]}]}},
        {$sort: {
            contentID: -1
        }}
    ],
        (err, result) => {
            if(err){
                res.send({ status: false, result: { message: "Error generating Messages" } })
                console.log(err)
            }
            else{
                // res.send({ status: true, result: result })
                // console.log(filterType)
                var resArray = [];

                if(result.length != 0){
                    // console.log(result[0].from)
                    result.map((data, i) => {
                        if(data.from.userID == id){
                            // console.log(data.to.userID);
                            resArray.push(data.to.userID)
                        }
                        else{
                            // console.log(data.from.userID);
                            resArray.push(data.from.userID)
                        }
                    })

                    setTimeout(() => {
                        generateProfilewithMessage(resArray, result)
                        // console.log(resArray)
                    }, 0)
                }
                else{
                    generateProfilewithMessage(resArray, result)
                    // console.log(result)
                }
            }
        })

})

//WHEN USER IS CREATED (ANY TYPE OF USER IN THE SYSTEM), also save their data in userprofiles collection in database

router.get('/initConversation/:conversationID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const conversationID = req.params.conversationID;

    ConversationData.find({conversationID: conversationID}, (err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Cannot retrieve conversation" } })
            console.log(err);
        }
        else{
            // res.send("ok")
            var otherID = result[0].from.userID == id? result[0].to.userID : result[0].from.userID;

            UserProfilesData.findOne({ userID: otherID }, (err2, result2) => {
                if(err2){
                    res.send({ status: false, result: { message: "Cannot retrieve user profile" } })
                    console.log(err2)
                }
                else{
                    res.send({ status: true, result: {
                        userDetails: result2,
                        conversation: result
                    } })
                }
            })
        }
    })
})

//LONG POLLING FOR MESSAGES

router.get('/subscribeMessages', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    responses[id] = res;

    req.on('close', () => {
        delete responses[id];
    })
})

router.get('/subscribeMessagesConvo', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    responsesConvo[id] = res;

    req.on('close', () => {
        delete responsesConvo[id];
    })
})

router.get('/subscribeAlertMessage', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    responsesAlert[id] = res;

    req.on('close', () => {
        delete responsesAlert[id];
    })
})

function respondToAllMsgData(sender, receiver, conversationID, type){
    for(let idd in responses){
        let otherres =  responses[idd];
        
        if(idd == sender){
            otherres.setHeader('Access-Control-Allow-Origin', '*');
            otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
            otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
            otherres.send({status: true, result: { message: "Ok", data: { conversationID: conversationID, listType: type } }})
        }
        if(idd == receiver){
            otherres.setHeader('Access-Control-Allow-Origin', '*');
            otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
            otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
            otherres.send({status: true, result: { message: "Ok", data: { conversationID: conversationID, listType: type } }})
        }
    }

    for(let idd in responsesConvo){
        let otherres =  responsesConvo[idd];
        
        if(idd == sender){
            otherres.setHeader('Access-Control-Allow-Origin', '*');
            otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
            otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
            otherres.send({status: true, result: { message: "Ok", data: { conversationID: conversationID, listType: type } }})
        }
        if(idd == receiver){
            otherres.setHeader('Access-Control-Allow-Origin', '*');
            otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
            otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
            otherres.send({status: true, result: { message: "Ok", data: { conversationID: conversationID, listType: type } }})
        }
    }

    for(let idd in responsesAlert){
        let otherres =  responsesAlert[idd];
        
        // if(idd == sender){
        //     otherres.setHeader('Access-Control-Allow-Origin', '*');
        //     otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
        //     otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
        //     otherres.send({status: true, result: { message: "Ok", data: { conversationID: conversationID, listType: type } }})
        // }
        if(idd == receiver){
            otherres.setHeader('Access-Control-Allow-Origin', '*');
            otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
            otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
            otherres.send({status: true, result: { message: "Ok", data: { conversationID: conversationID, listType: type } }})
        }
    }
}

//END OF LONG POLLING

router.get('/recipientlist/:filterType', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const filterType = req.params.filterType;

    UserProfilesData.find({userType: filterType},(err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Unable find Recipients!" } })
            console.log(err);
        }
        else{
            res.send({ status: true, result: result })
        }
    })
})

router.post('/newMessage', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const userType = req.params.userType;
    
    const contentID = `${makeid(20)}`;
    const content = req.body.content;
    const contentType = req.body.contentType;
    const contentTime = `${timeGetter()}`;
    const contentDate = `${dateGetter()}`;
    // const fromID = req.body.fromID;
    // const fromType = req.body.fromType;
    const toID = req.body.toID;
    const toType = req.body.toType;
    const filterType = req.body.filterType

    ConversationData.find({$or: [
        {"from.userID": id, "to.userID": toID},
        {"to.userID": id, "from.userID": toID}
    ]},(err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Unable to check conversation!" } })
            console.log(err);
        }
        else{
            // res.send("ok");
            // console.log(result)
            if(result.length == 0){
                //newMessage
                newMessage(`${makeid(15)}`)
            }
            else{
                //continueConvo
                checkandmakeContent(result[0].conversationID)
            }
        }
    })

    const newMessage = (convID) => {
        ConversationData.count({conversationID: convID},(err, result) => {
            if(err){
                res.send({ status: false, result: { message: "Error scanning conversation!" } })
                console.log(err)
            }
            else{
                // res.send("ok")
                // console.log(result)
                if(result == 0){
                    checkandmakeContent(convID)
                }
                else{
                    newMessage(`${makeid(15)}`)
                }
            }
        })
    }

    const checkandmakeContent = (confconvID) => {
        ConversationData.count({}, (err, result) => {
            if(err){
                res.send({ status: false, result: { message: "Error checking messages!" } })
                console.log(err)
            }
            else{

                const newContent = new ConversationData({
                    conversationID: confconvID,
                    contentID: result + 1,
                    content: content,
                    contentType: contentType,
                    contentTime: contentTime,
                    contentDate: contentDate,
                    from: {
                        userID: id,
                        userType: userType
                    },
                    to: {
                        userID: toID,
                        userType: toType
                    }
                })

                newContent.save().then(() => {
                    res.send({ status: true, result: { message: "Message Sent!", conversationID: confconvID } })
                    respondToAllMsgData(id, toID, confconvID, filterType)
                    // console.log("Good")
                }).catch((err) => {
                    res.send({ status: false, result: { message: "Unable to send message!" } })
                    console.log(err)
                })
            }
        })
    }
    
})

module.exports = router;

