const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

//Route for this is /admin

// let responses = []

const AdminData = require("../../schema/admin/admindata")
const CompanyData = require("../../schema/company/companydata")

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

//WORKING LONG POLLING BASIC
// router.get('/longpollingtest', (req, res) => {
//     res.writeHead(200, {'Content-type': 'text/javascript'})
//     var i = 1;

//     setInterval(() => {
//         res.write(`Number: ${i} `);
//         i++;
//         if(i > 10){
//             res.end();
//         }
//     }, 1000)
// })

router.get('/testadmin', (req, res) => {
    res.send({status: true, result:{
        message:"Testing Admin Processes!"
    }})
})

router.post('/createcompanyadmin', jwtverifier, (req, res) => {
    const companyID = req.body.companyID;
    const companyName = req.body.companyName;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const dateRegistered = req.body.dateRegistered;
    const email = req.body.email;
    const password = req.body.password;

    const newCompany = new CompanyData({
        companyID: companyID,
        companyName: companyName,
        companyAdmin: {
            firstname: firstname,
            lastname: lastname
        },
        dateRegistered: dateRegistered,
        email: email,
        password: password
    })

    newCompany.save().then(() => {
        res.send({status: true, result: {
            message: "New Company Added!"
        }})
    })
})

module.exports = router;