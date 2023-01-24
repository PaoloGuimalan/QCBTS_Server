const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

//SCHEMA INITIALIZATION
//NOTE: url in this route is /auth/:following route

const AdminData = require("../../schema/admin/admindata");
const CompanyData = require("../../schema/company/companydata");
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
    const companyAdminID = req.body.companyAdminID;
    const password = req.body.password;

    CompanyData.findOne({companyAdminID: companyAdminID, password: password}, (err, result) => {
        if(err){
            res.send({status: false, result: {
                message: "Unable to Login!"
            }})
        }
        else{
            if(result != null){
                if(result.status){
                    const token = jwt.sign({id: result.companyAdminID}, "qcbtsserver", {
                        expiresIn: 60 * 60 * 24 * 7
                    })
    
                    res.send({status: true, result: {
                        companyID: result.companyID,
                        companyAdminID: result.companyAdminID,
                        companyAdminName: `${result.companyAdmin.firstname} ${result.companyAdmin.lastname}`,
                        companyAdminEmail: result.email,
                        token: token
                    }})
                }
                else{
                    res.send({ status: false, result: {
                        message: "Account is Not Activated!"
                    } })
                }
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

router.get('/companyadmin/jwtchecker', jwtverifiercmpad, (req, res) => {
    const id = req.params.decodedID;

    CompanyData.findOne({companyAdminID: id}, (err, result) => {
        if(err){
            res.send({status: false, result: {
                message: "Unable to Login!"
            }})
        }
        else{
            if(result != null){
                if(result.status){
                    res.send({status: true, result: {
                        companyID: result.companyID,
                        companyAdminID: result.companyAdminID,
                        companyAdminName: `${result.companyAdmin.firstname} ${result.companyAdmin.lastname}`,
                        companyAdminEmail: result.email
                    }})
                }
                else{
                    res.send({ status: false, result: {
                        message: "Account is Not Activated!"
                    } })
                }
            }
            else{
                res.send({status: false, result: {
                    message: "No Account Matched!"
                }})
            }
        }
    })

    // res.send({status: true, result: {
    //     message: "jwt proceeds",
    //     id: req.params.decodedID
    // }})
})



//COMMUTER AUTH SECTION


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

router.post('/logincommuter', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    CommuterData.findOne({ email: email, password: password }, (err, result) => {
        if(err){
            console.log(err)
            res.send({ status: false, message: "Error checking account" })
        }
        else{
            if(result == null){
                res.send({ status: false, message: "No Existing Account" })
            }
            else{
                const token = jwt.sign({userID: result.userID}, "qcbtsserver", {
                    expiresIn: 60 * 60 * 24 * 7
                })

                res.send({ status: true, result: {
                    userID: result.userID,
                    username: result.username,
                    token: token
                } })
            }
        }
    })
})

router.post('/registercommuter', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const contactnumber = req.body.contactnumber;
    const password = req.body.password;
    const userIDpending = `commuter_${makeid(10)}`

    const makeUserProfile = (userID) => {
        const newuserProfile = new UserProfilesData({
            userID: userID,
            userDisplayName: name,
            preview: "none",
            userType: "commuter"
        })

        newuserProfile.save().then(() => {
            res.send({ status: true, message: "Account has been Successfully Registered" })
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, message: "Unable to Register Account" })
        })
    }

    const createCommuterAccount = (verifiedID) => {
        const newCommuter = new CommuterData({
            userID: verifiedID,
            username: `${name.split(" ").join("")}_${makeid(10)}`,
            name: name,
            email: email,
            contactnumber: contactnumber,
            password: password
        })

        newCommuter.save().then(() => {
            // res.send({ status: true, message: "Account has been Successfully Registered" })
            makeUserProfile(verifiedID)
        }).catch((err) => {
            console.log(err)
            res.send({ status: false, message: "Unable to Register Account" })
        })
    }

    const scanExistingID = (pendingID) => {
        CommuterData.find({ userID: pendingID }, (err, result) => {
            if(err){
                console.log(err)
                res.send({ status: false, message: "Unable to verify account" })
            }
            else{
                if(result.length == 0){
                    createCommuterAccount(pendingID)
                }
                else{
                    scanExistingID(`commuter_${makeid(10)}`)
                }
            }
        })
    }

    scanExistingID(userIDpending)
})

router.get('/commuter/jwtchecker', jwtverifiercommuter, (req, res) => {
    const userID = req.params.userID;
    const username = req.params.username;

    res.send({ status: true, result: {
        userID: userID,
        username: username
    } })
})

module.exports = router;