const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const CompanyData = require("../../schema/company/companydata");

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

                CompanyData.findOne({companyID: id}, (err, result) => {
                    if(err){
                        res.send({status: false, result:{
                            message: "Error checking account!"
                        }})
                    }
                    else{
                        if(id.includes("company")){
                            if(result.companyID == id){
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

router.get('/data', jwtverifier, (req, res) => {
    CompanyData.findOne({companyID: req.params.decodedID}, (err, result) => {
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

module.exports = router;