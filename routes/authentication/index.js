const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

//SCHEMA INITIALIZATION
//NOTE: url in this route is /auth/:following route

const AdminData = require("../../schema/admin/admindata");
const CompanyData = require("../../schema/company/companydata");
const UserProfilesData = require("../../schema/allusers/userprofiles")

router.use((req, res, next) => {
    next();
})

router.get('/', (req, res) => {
    res.send("API Null!");
})

router.post('/loginadmin', (req, res) => {
    const adminID = req.body.adminID;
    const password = req.body.password

    AdminData.findOne({adminID: adminID, password: password}, {password: 0, __v: 0, _id: 0}, (err, result) => {
        if(err){
            console.log(err);
            res.send("Admin Auth Error!")
        }
        else{
            if(result != null){
                const token = jwt.sign({id: result.adminID}, "qcbtsserver", {
                    expiresIn: 60 * 60 * 24 * 7
                })
                //expiresIn: 60 * 60 * 24 * 7

                res.send({status: true, result: {
                    ...result._doc,
                    token: token
                }})
            }
            else{
                res.send({status: false, result: {
                    message: "No user found!"
                }})
            }
        }   
    })
})

router.post('/createAdmin', (req, res) => {
    const adminID = req.body.adminID;
    const firstname =  req.body.firstname;
    const middlename =  req.body.middlename;
    const lastname =  req.body.lastname;
    const email =  req.body.email;
    const password =  req.body.password;

    const userProfileSave = () => {
        const newuserProfile = new UserProfilesData({
            userID: adminID,
            userDisplayName: `${firstname} ${middlename} ${lastname}`,
            preview: "none",
            userType: "systemAdmin"
        })

        newuserProfile.save().then(() => {
            res.send({status: true, result: {
                message: "New System Admin Added!"
            }})
        }).catch((err) => {
            res.send({status: false, result: {
                message: "Unable to save System Admin user profile"
            }})
            console.log(err)
        })
    }
    
    const newAdmin = new AdminData({
        adminID: adminID,
        firstname: firstname,
        middlename: middlename,
        lastname: lastname,
        email: email,
        password: password
    })

    newAdmin.save().then(() => {
        userProfileSave()
        // res.send({status: true, result: "Admin Created!"})
    })
})

router.post('/createAdminProfile', (req, res) => {
    const adminID = req.body.adminID;
    const firstname =  req.body.firstname;
    const middlename =  req.body.middlename;
    const lastname =  req.body.lastname;
    const email =  req.body.email;
    const password =  req.body.password;

    const newuserProfile = new UserProfilesData({
        userID: adminID,
        userDisplayName: middlename == ""? `${firstname} ${lastname}` : `${firstname} ${middlename} ${lastname}`,
        preview: "none",
        userType: "systemAdmin",
    })

    newuserProfile.save().then(() => {
        res.send({status: true, result: { message: "System Admin User Profile has been Added!" }})
    }).catch((err) => {
        console.log(err)
        res.send({ status: false, result: { message: "Error at /createAdminProfile" } })
    })
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

router.get('/admin/jwtchecker', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    AdminData.findOne({adminID: id}, {password: 0, __v: 0, _id: 0}, (err, result) => {
        if(err){
            console.log(err);
            res.send("Admin Auth Error!")
        }
        else{
            if(result != null){
                res.send({status: true, result: {
                    ...result._doc
                }})
            }
            else{
                res.send({status: false, result: {
                    message: "No user found!"
                }})
            }
        }   
    })
})

router.post('/logincompany', (req, res) => {
    const companyID = req.body.companyID;
    const password = req.body.password;

    CompanyData.findOne({companyID: companyID, password: password}, (err, result) => {
        if(err){
            res.send({status: false, result: {
                message: "Unable to Login!"
            }})
        }
        else{
            if(result != null){
                const token = jwt.sign({id: result.companyID}, "qcbtsserver", {
                    expiresIn: 10000
                })

                res.send({status: true, result: {
                    companyID: result.companyID,
                    token: token
                }})
            }
            else{
                res.send({status: false, result: {
                    message: "No Account Matched!"
                }})
            }
        }
    })
})

const jwtverifiercmpad = (req, res, next) => {
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

router.get('/companyadmin/jwtchecker', jwtverifiercmpad, (req, res) => {
    res.send({status: true, result: {
        message: "jwt proceeds",
        id: req.params.decodedID
    }})
})

module.exports = router;