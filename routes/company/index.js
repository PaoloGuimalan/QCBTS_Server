const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const CompanyData = require("../../schema/company/companydata");
const CompanyRegdata = require("../../schema/company/companyRegdata")
const BusStopsData = require("../../schema/configs/busstops")

router.use((req, res, next) => {
    next();
})

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

router.get('/enabledBusStops', (req, res) => {
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

module.exports = router;