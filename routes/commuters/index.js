const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const UserProfilesData = require("../../schema/allusers/userprofiles")
const CommuterData = require("../../schema/commuters/commuterdata")
const BusStopsData = require("../../schema/configs/busstops")
const RoutesData = require("../../schema/configs/routes")
const PostsData = require("../../schema/posts/posts")
const WaitingData = require("../../schema/commuters/waiting")
const AssignedRoutes = require("../../schema/configs/assignedRoute")
const Driver = require("../../schema/driver/driverRegister")
const CompanyRegdata = require("../../schema/company/companyRegdata")
const BusData = require("../../schema/configs/buses")

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
    RoutesData.find({ privacy: true }, (err, result) => {
        if(err){
            console.log(err)
            res.send({ status: false, message: "Unable to retrieve routes" })
        }
        else{
            res.send({ status: true, result: result })
        }
    })
})

router.get('/getPosts', jwtverifiercommuter, (req, res) => {
    const id = req.params.decodedID;

    PostsData.find({$or: [{ viewers: "all" }, { viewers: "commuters" }]}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Unable to get posts"})
        }
        else{
            // console.log(result);
            res.send({status: true, result: result})
        }
    })
})

router.post('/postWaitingStatus', jwtverifiercommuter, (req, res) => {
    const id = req.params.userID;
    const busStopID = req.body.busStopID;

    WaitingData.findOne({userID: id}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Error scanning waiting status!"})
        }
        else{
            // console.log(result)
            // res.send({status: true, message: "Status is on Waiting"})
            if(result == null){
                const newWaiting = new WaitingData({
                    busStopID: busStopID,
                    userID: id,
                    date: dateGetter(),
                    time: timeGetter(),
                    status: "waiting"
                })

                newWaiting.save().then(() => {
                    res.send({status: true, message: "Status is on Waiting"})
                }).catch((err1) => {
                    console.log(err1)
                    res.send({status: false, message: "Unable to set status on Waiting"})
                })
            }
            else{
                WaitingData.findOneAndUpdate({userID: id}, { busStopID: busStopID, date: dateGetter(), time: timeGetter(), status: "waiting" }, (err2, result2) => {
                    if(err2){
                        res.send({status: false, message: "Unable to set status on Waiting"})
                    }
                    else{
                        res.send({status: true, message: "Status updated to Waiting"})
                    }
                })
            }
        }
    })
})

router.post('/postIdleStatus', jwtverifiercommuter, (req, res) => {
    const id = req.params.userID;
    // const busStopID = req.body.busStopID;

    WaitingData.findOne({userID: id}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Error scanning waiting status!"})
        }
        else{
            // console.log(result)
            // res.send({status: true, message: "Status is on Waiting"})
            if(result == null){
                res.send({status: true, message: "Status is on Idle"})
            }
            else{
                WaitingData.findOneAndUpdate({userID: id}, { status: "idle" }, (err2, result2) => {
                    if(err2){
                        console.log(err2)
                        res.send({status: false, message: "Unable to set status on Idle"})
                    }
                    else{
                        res.send({status: true, message: "Status updated to Idle"})
                    }
                })
            }
        }
    })
})

router.get("/initWaitingData", jwtverifiercommuter, (req, res) => {
    const id = req.params.userID;

    WaitingData.findOne({userID: id, status: "waiting"}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Error initial waiting status"})
        }
        else{
            // console.log(result)
            if(result == null){
                res.send({status: true, result: "OK"})
            }
            else{
                res.send({status: true, result: result})
            }
        }
    })
})

router.get('/feedInfo/:postID', jwtverifiercommuter, (req, res) => {
    const id = req.params.userID;
    const postID = req.params.postID

    PostsData.findOne({postID: postID}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Error getting Feed Info"})
        }
        else{
            res.send({status: true, result: result})
        }
    })
})

//LONG POLLING FOR WAITING STATUS SETTER

router.get('/pollWaitingStatus', jwtverifiercommuter, (req, res) => {
    const id = req.params.userID;

    // console.log(`${id} Connected`)

    req.on('close', () => {
        // console.log(`${id} Closed`)
        WaitingData.findOne({userID: id}, (err, result) => {
            if(err){
                console.log(err)
                // res.send({status: false, message: "Error scanning waiting status!"})
            }
            else{
                // console.log(result)
                // res.send({status: true, message: "Status is on Waiting"})
                if(result == null){
                    // res.send({status: true, message: "Status is on Idle"})
                }
                else{
                    WaitingData.findOneAndUpdate({userID: id}, { status: "idle" }, (err2, result2) => {
                        if(err2){
                            console.log(err2)
                            // res.send({status: false, message: "Unable to set status on Idle"})
                        }
                        else{
                            // res.send({status: true, message: "Status updated to Idle"})
                            // console.log(`${id} Idle`)
                        }
                    })
                }
            }
        })
    })
})

router.get('/allassignedroutes', jwtverifiercommuter, (req, res) => {
    const id = req.params.userID;

    AssignedRoutes.find({}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Cannot generate assigned routes"})
        }
        else{
            res.send({status: true, result: result})
        }
    })
})

router.get('/commuterSearch/:keyword', jwtverifiercommuter, (req, res) => {
    const id = req.params.userID;
    const keyword = req.params.keyword

    BusStopsData.find({ $or: [{stationName: { $regex: keyword, $options: "i" }, status: true}, {stationAddress: { $regex: keyword, $options: "i" }, status: true}, {busStopID: { $regex: keyword, $options: "i" }, status: true}] }, (err, result) => {
        if(err){
            console.log(err);
            res.send({status: false, message: "Cannot process search result"})
        }
        else{
            RoutesData.find({ $or: [{routeName: { $regex: keyword, $options: "i" }, privacy: true}, {routeID: { $regex: keyword, $options: "i" }, privacy: true}] }, (err2, result2) => {
                if(err2){
                    console.log(err)
                    res.send({status: false, message: "Cannot process search result"})
                }
                else{
                    res.send({status: true, result: {
                        BusStops: result,
                        Routes: result2
                    }})
                }
            })
        }
    })

    // res.send({status: true, result: {
    //     BusStops: [],
    //     Routes: []
    // }})
})

//LONG POLLING FOR WAITING STATUS SETTER

router.post('/busInfoData', jwtverifiercommuter, (req, res) => {
    const id = req.params.userID;
    
    const driverID = req.body.driverID;
    const companyID = req.body.companyID;
    const busID = req.body.busID;
    const routeID = req.body.routeID

    // console.log("OK")
    // res.send({status: true, result: "OK"})

    Driver.findOne({userID: driverID},{email: 0, pass: 0, mobileNumber: 0, age: 0}, (err, result) => {
        if(err){
            console.log(err);
            res.send({status: false, message: "Cannot Process Bus Profile"})
        }
        else{
            CompanyRegdata.findOne({companyID: companyID}, (err1, result1) => {
                if(err1){
                    console.log(err1)
                    res.send({status: false, message: "Cannot Process Bus Company"})
                }
                else{
                    BusData.findOne({busID: busID}, (err2, result2) => {
                        if(err2){
                            console.log(err2)
                            res.send({status: false, message: "Cannot Process Bus Info"})
                        }
                        else{
                            RoutesData.findOne({routeID: routeID}, (err3, result3) => {
                                if(err3){
                                    console.log(err3)
                                    res.send({status: false, message: "Cannot Process Bus Route"})
                                }
                                else{
                                    // console.log({
                                    //     driverdata: result,
                                    //     companydata: result1,
                                    //     busdata: result2,
                                    //     routesdata: result3
                                    // })
                                    res.send({status: true, result: {
                                        driverdata: result,
                                        companydata: result1,
                                        busdata: result2,
                                        routesdata: result3
                                    }})
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

module.exports = router;