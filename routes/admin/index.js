const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

//Route for this is /admin

let responses = Object.create(null);

const AdminData = require("../../schema/admin/admindata")
const CompanyData = require("../../schema/company/companydata")
const CompanyRegdata = require("../../schema/company/companyRegdata")
const BusStopsData = require("../../schema/configs/busstops")

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
    const companyID = req.body.companyID;
    const companyAdminID = `companyadmin_${makeid(6)}`;
    const companyName = req.body.companyName;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    // const companyNumber = req.body.companyNumber;
    // const companyAddress = req.body.companyAddress;
    // const preview = req.body.preview;
    const dateRegistered = dateGetter();
    const email = req.body.email;
    const password = req.body.password;

    const saveData = (compID, compAdID) => {

        const newCompany = new CompanyData({
            companyID: compID,
            companyAdminID: compAdID,
            companyName: companyName,
            companyAdmin: {
                firstname: firstname,
                lastname: lastname
            },
            // companyNumber: companyNumber,
            // companyAddress: companyAddress,
            // preview: preview,
            status: false,
            dateRegistered: dateRegistered,
            email: email,
            password: password
        })

        newCompany.save().then(() => {
            res.send({status: true, result: {
                message: "New Company Admin Added!"
            }})
        }).catch((err) => {
            res.send({status: false, result: {
                message: "Unable to save new admin!"
            }})
            console.log(err);
        })
    }

    const dataAdminCheck = (adID, cadID) => {
        CompanyData.findOne({companyAdminID: adID}, (err, result) => {
            if(err){
                res.send({status: false, result: { message: "Error creating Company Admin!" }})
                console.log(err)
            }
            else{
                if(result == null){
                    saveData(cadID, adID)
                }
                else{
                    dataAdminCheck(`companyadmin_${makeid(6)}`, cadID)
                }
            }
        })
    }


    const dataCheck = (id) => {
        if(id == null){
            dataAdminCheck(companyAdminID ,`company_${makeid(6)}`)
        }
        else{
            CompanyRegdata.findOne({companyID: id}, (err, result) => {
                if(err){
                    res.send({status: false, result: { message: "Error creating Company Admin!" }})
                    console.log(err)
                }
                else{
                    if(result == null){
                        res.send({status: false, result: { message: "No Company Matched with the Company ID provided!" }})
                    }
                    else{
                        dataAdminCheck(`companyadmin_${makeid(6)}`, id)
                    }
                }
            })
        }
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
    const companyAdminID = req.body.companyAdminID;
    const status = req.body.status;

    CompanyData.updateOne({ companyAdminID: companyAdminID }, { status: status }, (err, result) => {
        if(err){
            console.log(err);
            res.send({ status: false, result: { message: `${status? "Activation" : "Deactivation"} was interrupted!` } })
        }
        else{
            res.send({ status: true, result: { message: `${companyAdminID} has been ${status? "Activated" : "Deactivated"}` } })
        }
    })
})

router.post('/createcompanyreg', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = `company_${makeid(6)}`;
    const companyName = req.body.companyName;
    const companyAddress = req.body.companyAddress;
    const companyNumber = req.body.companyNumber;
    const email = req.body.companyEmail;
    const dateRegistered = dateGetter();
    const preview = req.body.preview;

    const saveData = (finalID) => {
        const newData = new CompanyRegdata({
            companyID: finalID,
            companyName: companyName,
            companyAddress: companyAddress,
            companyNumber: companyNumber,
            email: email,
            dateRegistered: dateRegistered,
            preview: preview
        });

        newData.save().then(() => {
            res.send({status: true, result: {
                message: "New Company Added!"
            }})
        })
    }

    const dataCheck = (cmpID) => {
        CompanyRegdata.findOne({companyID: cmpID}, (err, result) => {
            if(err){
                res.send({status: false, result:{
                    message: "Error Validating Data!"
                }})
            }
            else{
                if(result == null){
                    //good
                    saveData(cmpID)
                }
                else{
                    dataCheck(`company_${makeid(6)}`)
                }
            }
        })
    }

    dataCheck(companyID)
})

router.get('/companyreglist', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    CompanyRegdata.find({}, (err, result) => {
        if(err){
            res.send({status: false, result: { message: "Cannot fetch list!" }})
            console.log(err);
        }
        else{
            res.send({status: true, result: result})
        }
    })
})

router.get('/companydetails/:companyID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.params.companyID;

    CompanyRegdata.findOne({companyID: companyID}, (err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Error processing Company Details!" } })
            console.log(err);
        }
        else{
            res.send({ status: true, result: result })
        }
    })
})

router.get('/allcompanydata/:companyID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.params.companyID;

    CompanyRegdata.findOne({companyID: companyID}, (err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Could not query Company Data!" } })
            console.log(err);
        }
        else{
            if(result != null){
                CompanyData.find({companyID: companyID}, { password: 0 }, (err2, result2) => {
                    if(err2){
                        res.send({ status: false, result: { message: "Unable to query Company Admins Data!" } })
                        console.log(err2);
                    }
                    else{
                        res.send({ status: true, result: {
                            companydata: result,
                            adminlist: result2
                        } })
                    }
                })
            }
            else{
                res.send({ status: false, result: { message: "There is no company in this account!" } })
            }
        }
    })
})

router.post('/updateCompanyData', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.body.companyID;
    const companyName = req.body.companyName;
    const companyNumber = req.body.companyNumber;
    const companyEmail = req.body.companyEmail;
    const companyAddress = req.body.companyAddress;

    CompanyRegdata.updateOne({ companyID: companyID }, 
        { companyName: companyName, companyNumber: companyNumber, email: companyEmail, companyAddress: companyAddress },
        (err, result) => {
            if(err){
                res.send({ status: false, result: { message: "Update Data failed!" } })
                console.log(err);
            }
            else{
                CompanyData.updateMany({ companyID: companyID }, { companyName: companyName }, (err2, result2) => {
                    if(err2){
                        res.send({ status: false, result: { message: "Update Data failed!" } })
                        console.log(err2);
                    }
                    else{
                        res.send({ status: true, result: { message: "Company Data have been successfully updated!" } })
                    }
                })
            }
        })

    // console.log({ companyID, companyName, companyNumber, companyEmail, companyAddress });
})

router.get('/getCompanyAdminData/:companyAdID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyAdID = req.params.companyAdID;

    CompanyData.findOne({companyAdminID: companyAdID}, { password: 0 }, (err, result) => {
        if(err){
            res.send({ status: true, result: { message: "Unable to find admin data!" } })
            console.log(err)
        }
        else{
            // console.log(result)
            res.send({ status: true, result: result })
        }
    })
})

router.post('/updateCompanyAdminData', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const compAdID = req.body.companyAdminID;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;

    CompanyData.updateOne({ companyAdminID: compAdID }, { companyAdmin: { firstname: firstName, lastname: lastName }, email: email },
        (err, result) => {
            if(err){
                console.log(err);
                res.send({ status: false, result: { message: "Cannot update Company Admin data!" } })
            }
            else{
                res.send({ status: true, result: { message: "Company Admin data updated!" } })
            }
        })
})

router.post('/updateCompanyAdminPassword', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const compAdID = req.body.compAdID;
    const adminPassword = req.body.adminPassword;
    const newCompanyAdminPassword =  req.body.newPassword;

    AdminData.findOne({ adminID: id, password: adminPassword }, (err, result) => {
        if(err){
            res.send({status: false, result: { message: "Verification Failed!" }})
            console.log(err);
        }
        else{
            if(result != null){
                CompanyData.updateOne({ companyAdminID: compAdID }, { password: newCompanyAdminPassword }, (err2, result2) => {
                    if(err2){
                        res.send({ status: false, result: { message: "Password update Failed!" } })
                        console.log(err2)
                    }
                    else{
                        res.send({ status: true, result: { message: "Password has been Updated!" } })
                    }
                })
            }
            else{
                res.send({ status: false, result: { message: "You are not authorized to do this action!" } })
            }
        }
    })
})

/**
 * Partial Part of Long Polling: in Add Bus Stops
 */

router.post('/addBusStop', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const busStopID = `BS_${makeid(6)}`;
    const stationName = req.body.stationName;
    const stationAddress = req.body.stationAddress;
    const longitude = req.body.longitude;
    const latitude = req.body.latitude;
    const dateNow = dateGetter();

    const checkAddBusStopID = (BSID) => {
        BusStopsData.find({ busStopID: busStopID }, (err, result) => {
            if(err){
                res.send({ status: false, result: { message: "Failed to Check Bus Stop" } })
                console.log(err)
            }
            else{
                if(result.length != 0){
                    checkAddBusStopID(`BS_${makeid(6)}`)
                }
                else{
                    const newBusStop = new BusStopsData({
                        busStopID: BSID,
                        stationName: stationName,
                        stationAddress: stationAddress,
                        coordinates: {
                            longitude: longitude,
                            latitude: latitude
                        },
                        dateAdded: dateNow,
                        addedBy: id,
                        status: false
                    })

                    newBusStop.save().then(() => {
                        res.send({ status: true, result: { message: "New Bus Stop has been Added" } })
                        respondToAllBSData()
                    }).catch((errc) => {
                        res.send({ status: false, result: { message: "Error in creating Bus Stop" } })
                        console.log(errc)
                    })
                }
            }
        })
    }

    checkAddBusStopID(busStopID)

    // console.log(req.body)
})

function respondToAllBSData(){
    BusStopsData.find({}, (err, result) => {
        if(err){
            for(let id in responses){
                let otherres =  responses[id];
                otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
                otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
                otherres.send({status: false, result: { message: "Cannot establish data!" }})
            }
        }
        else{
            for(let id in responses){
                let otherres =  responses[id];
                otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
                otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
                otherres.send({status: true, result: result})
            }
        }
    })
}

/**
 * Long Polling Bus Stops Data
 */

router.get('/initBusStopsData', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    BusStopsData.find({}, (err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Cannot process data!" } })
        }
        else{
            res.send({ status: true, result: result })
        }
    })
})

router.get('/busStopsDataSubscribe', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    responses[id] =  res;

    req.on('close', () => {
        delete responses[id];
    })
})

router.post('/updateStopStatus', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const stopID = req.body.stopID;
    const stopStatus = req.body.stopStatus;

    BusStopsData.updateOne({ busStopID: stopID }, { status: stopStatus }, (err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Unable to update Bus Stop status" } })
            console.log(err)
        }
        else{
            res.send({ status: true, result: { message: `Station ${stopID} status has been updated` } })
            respondToAllBSData()
        }
    })
})

router.get('/deleteBusStop/:busStopID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const busStopID = req.params.busStopID

    BusStopsData.deleteOne({ busStopID:  busStopID}, (err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Unable to delete Bus Stop" } })
            console.log(err)
        }
        else{
            respondToAllBSData()
            res.send({ status: true, result: { message: "Bus Stop has been deleted" } })
        }
    })
})

/**
 * End of Long Polling
 */

router.get('/getSpecificBusStopData/:busStopID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const busStopID =  req.params.busStopID;

    BusStopsData.findOne({busStopID: busStopID}, (err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Cannot get Bus Stop Data" } })
            console.log(err);
        }
        else{
            res.send({ status: true, result: result })
            // console.log(result)
        }
    })
})

module.exports = router;