const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const CompanyData = require("../../schema/company/companydata");
const CompanyRegdata = require("../../schema/company/companyRegdata")
const BusStopsData = require("../../schema/configs/busstops")
const RoutesData = require("../../schema/configs/routes")
const AdminData = require("../../schema/admin/admindata")

router.use((req, res, next) => {
    next();
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
                // console.log(id)

                CompanyData.findOne({companyAdminID: id, status: true}, (err, result) => {
                    if(err){
                        res.send({status: false, result:{
                            message: "Error checking account!"
                        }})
                    }
                    else{
                        if(result != null){
                            if(id.includes("companyadmin")){
                                if(result.companyAdminID == id){
                                    req.params.decodedID = decode.id
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
                        else{
                            res.send({status: false, result:{
                                message: "Account has been Deactivated"
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

const jwtverifierad = (req, res, next) => {
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

                if(id.split("_")[0] == "admin"){
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
                else if(id.split("_")[0] == "companyadmin"){
                    CompanyData.findOne({companyAdminID: id, status: true}, (err, result) => {
                        if(err){
                            res.send({status: false, result:{
                                message: "Error checking account!"
                            }})
                        }
                        else{
                            if(result != null){
                                if(id.includes("companyadmin")){
                                    if(result.companyAdminID == id){
                                        req.params.decodedID = decode.id
                                        req.params.userType = "companyadmins"
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
                            else{
                                res.send({status: false, result:{
                                    message: "Account has been Deactivated"
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

router.get('/', (req, res) => {
    res.send("Company API");
})

router.get('/data/:companyID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID =  req.params.companyID;

    CompanyRegdata.findOne({companyID: companyID}, (err, result) => {
        if(err){
            res.send({status: false, result: {
                message: "Data fetch error!"
            }})
        }
        else{
            if(result != null){
                res.send({status: true, result: result})
            }
            else{
                res.send({status: false, result:{
                    message: "No Existing Data!"
                }})
            }
        }
    })
})

router.get('/enabledBusStops', jwtverifier, (req, res) => {
    BusStopsData.find({status: true}, (err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Cannot fetch Bus Stops" } })
            console.log(err)
        }
        else{
            res.send({ status: true, result: result })
        }
    })
})

router.post('/createRoute', jwtverifierad, (req, res) => {
    const id = req.params.decodedID;
    const routeName = req.body.routeName;
    const stationList = req.body.stationList;
    const routePath = req.body.routePath;
    const companyID = req.body.companyID;
    const privacy = req.body.privacy;

    const newRoute = new RoutesData({
        routeID: `RT_${makeid(8)}`,
        routeName: routeName,
        stationList: stationList,
        routePath: routePath,
        dateAdded: dateGetter(),
        addedBy: id,
        companyID: companyID,
        privacy: privacy,
        status: false
    })

    newRoute.save().then(() => {
        res.send({ status: true, result: { message: "New Route has been Saved!" } })
    }).catch((err) => {
        res.send({ status: false, result: { message: "Route cannot be saved" } })
        console.log(err)
    })

    // console.log(req.body);
})

router.get('/routesList/:companyID', jwtverifierad, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.params.companyID;

    RoutesData.find({ companyID: companyID }, (err, result) => {
        if(err){
            console.log(err);
            res.send({ status: false, result: { message: "Error generating route list" } })
        }
        else{
            res.send({ status: true, result: result })
        }
    })
})

router.get('/publicRouteList', jwtverifierad, (req, res) => {
    const id = req.params.decodedID;

    RoutesData.find({ privacy: true }, (err, result) => {
        if(err){
            console.log(err);
            res.send({ status: false, result: { message: "Error generating public route list" } })
        }
        else{
            res.send({ status: true, result: result })
        }
    })
})

router.get('/busStopDetails/:busStopID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const busStopID = req.params.busStopID;

    BusStopsData.findOne({busStopID: busStopID, status: true}, (err, result) => {
        if(err){
            console.log(err);
            res.send({ status: true, result: { message: "Cannot find bus stop data" } })
        }
        else{
            res.send({ status: true, result: result })
        }
    })
})

module.exports = router;