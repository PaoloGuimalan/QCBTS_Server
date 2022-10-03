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

router.post('/createcompanyadmin', jwtverifier, async (req, res) => {
    const companyID = `company_${makeid(6)}`;
    const companyName = req.body.companyName;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const companyNumber = req.body.companyNumber;
    const preview = req.body.preview;
    const dateRegistered = dateGetter();
    const email = req.body.email;
    const password = req.body.password;

    const saveData = (compID) => {

        const newCompany = new CompanyData({
            companyID: compID,
            companyName: companyName,
            companyAdmin: {
                firstname: firstname,
                lastname: lastname
            },
            companyNumber: companyNumber,
            preview: preview,
            status: false,
            dateRegistered: dateRegistered,
            email: email,
            password: password
        })

        newCompany.save().then(() => {
            res.send({status: true, result: {
                message: "New Company Added!"
            }})
        })
    }


    const dataCheck = (id) => {
        CompanyData.findOne({companyID: id}, (err, result) => {
            if(err){
                res.send({status: false, result: { message: "Error creating Company Admin!" }})
                console.log(err)
            }
            else{
                if(result == null){
                    saveData(id)
                }
                else{
                    dataCheck(`company_${makeid(6)}`)
                }
            }
        })
    }

    dataCheck(companyID)
    // saveData(companyID);
})

router.get('/companylist', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    CompanyData.find({}, { password: 0 }, (err, result) => {
        if(err){
            res.send({status: false, result:{
                message: "Error Validating Data!"
            }})
        }
        else{
            res.send({ status: true, result: result })
            // console.log(result);
        }
    })
})

router.post('/updatecompanystatus', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.body.companyID;
    const status = req.body.status;

    CompanyData.updateOne({ companyID: companyID }, { status: status }, (err, result) => {
        if(err){
            console.log(err);
            res.send({ status: false, result: { message: `${status? "Activation" : "Deactivation"} was interrupted!` } })
        }
        else{
            res.send({ status: true, result: { message: `${companyID} has been ${status? "Activated" : "Deactivated"}` } })
        }
    })
})

module.exports = router;