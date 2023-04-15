const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

//Route for this is /admin

let responses = Object.create(null);
let pendingResponses = [];

const AdminData = require("../../schema/admin/admindata")
const CompanyData = require("../../schema/company/companydata")
const CompanyRegdata = require("../../schema/company/companyRegdata")
const BusStopsData = require("../../schema/configs/busstops")
const UserProfilesData = require("../../schema/allusers/userprofiles")
const PostsData = require("../../schema/posts/posts")
const Driver = require("../../schema/driver/driverRegister")
const RoutesData = require("../../schema/configs/routes")
const AssignedRoutes = require("../../schema/configs/assignedRoute")
const BusData = require("../../schema/configs/buses")
const CommuterData = require("../../schema/commuters/commuterdata")
const UserActivities = require("../../schema/configs/useractivities")

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

function timeGetter(){
    var today = new Date();
    var hour = String(today.getHours() % 12 || 12);
    var minutes = String(today.getMinutes() >= 9? today.getMinutes() : `0${today.getMinutes()}`)
    var seconds = String(today.getSeconds() >= 9? today.getSeconds() : `0${today.getSeconds()}`)
    var timeIndicator = hour >= 12? "am" : "pm"

    return today = `${hour}:${minutes}:${seconds} ${timeIndicator}`;
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
        message:"Testing Admin Processes!",
        subscribers: Object.keys(responses)
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

    const userProfileSave = (id, type) => {
        const newuserProfile = new UserProfilesData({
            userID: id,
            userDisplayName: `${firstname} ${lastname}`,
            preview: "none",
            userType: type
        })

        newuserProfile.save().then(() => {
            res.send({status: true, result: {
                message: "New Company Admin Added!"
            }})
        }).catch((err) => {
            res.send({status: false, result: {
                message: "Unable to save admin user profile"
            }})
            console.log(err)
        })
    }

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
            userProfileSave(compAdID, "companyAdmin")
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
    const ltoregno = req.body.ltoregno;
    const dateRegistered = dateGetter();
    const preview = req.body.preview;

    const saveData = (finalID) => {
        const newData = new CompanyRegdata({
            companyID: finalID,
            companyName: companyName,
            companyAddress: companyAddress,
            companyNumber: companyNumber,
            email: email,
            ltoregno: ltoregno,
            dateRegistered: dateRegistered,
            preview: preview
        });

        newData.save().then(() => {
            res.send({status: true, result: {
                message: "New Company Added!"
            }})
            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `New Company ${finalID} were registered`, "Admin Web App")
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
                        postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Company Data ${companyID} were updated`, "Admin Web App")
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

    const updateCompanyAdminProfile = () => {
        UserProfilesData.updateOne({ userID: compAdID }, { userDisplayName: `${firstName} ${lastName}` },
        (err, result) => {
            if(err){
                res.send({ status: false, result: { message: "Cannot update Company Admin profile!" } })
                console.log(err)
            }
            else{
                res.send({ status: true, result: { message: "Company Admin data updated!" } })
            }
        })
    }

    CompanyData.updateOne({ companyAdminID: compAdID }, { companyAdmin: { firstname: firstName, lastname: lastName }, email: email },
        (err, result) => {
            if(err){
                console.log(err);
                res.send({ status: false, result: { message: "Cannot update Company Admin data!" } })
            }
            else{
                updateCompanyAdminProfile()
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
                        postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `New Bus Stop ${BSID} has been added`, "Admin Web App")
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
    // BusStopsData.find({}, (err, result) => {
    //     if(err){
    //         for(let id in responses){
    //             let otherres =  responses[id];
    //             otherres.setHeader('Access-Control-Allow-Origin', '*');
    //             otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
    //             otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
    //             otherres.send({status: false, result: { message: "Cannot establish data!" }})
    //         }
    //     }
    //     else{
    //         for(let id in responses){
    //             let otherres =  responses[id];
    //             otherres.setHeader('Access-Control-Allow-Origin', '*');
    //             otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
    //             otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
    //             otherres.send({status: true, result: result})
    //         }
    //     }
    // })

    for(let id in responses){
        let otherres =  responses[id];
        otherres.setHeader('Access-Control-Allow-Origin', '*');
        otherres.setHeader('Content-Type', 'text/plain;charset=utf-8');
        otherres.setHeader("Cache-Control", "no-cache, must-revalidate");
        otherres.send({status: true, result: { message: "Ok" }})
    }
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

    // console.log(id);

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
            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Bus Stop ${stopID} status has been updated to ${stopStatus}`, "Admin Web App")
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
            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Bus Stop ${busStopID} were deleted`, "Admin Web App")
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

router.get('/getCompanyListDA', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    CompanyRegdata.find({}, (err, result) => {
        if(err){
            res.send({ status: false, result: { message: "Cannot establish Company Data List" } })
            console.log(err);
        }
        else{
            res.send({ status: true, result: result })
        }
    })
})

router.post('/postUpdates', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const postID = `PS_${makeid(10)}`;
    const title = req.body.title;
    const preview = req.body.preview;
    const content = req.body.content;
    const viewers = req.body.viewers;
    const date = dateGetter();
    const time = timeGetter()

    const checkPostID = (postIDParam) => {
        PostsData.find({ postID: postIDParam }, (err, result) => {
            if(err){
                console.log(err)
                res.send({ status: false, message: "Unable to process post" })
            }
            else{
                if(result.length != 0){
                    checkPostID(`PS_${makeid(10)}`)
                }
                else{
                    const newPost = new PostsData({
                        postID: postIDParam,
                        title: title,
                        preview: preview,
                        content: content,
                        viewers: viewers,
                        date: date,
                        time: time
                    })

                    newPost.save().then(() => {
                        res.send({status: true, message: "Update has been posted"})
                        postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `New Feed ${postIDParam} has been posted`, "Admin Web App")
                    }).catch((err) => {
                        console.log(err)
                        res.send({status: false, message: "Update cannot be posted"})
                    })
                }
            }
        })
    }

    checkPostID(postID)
})

router.get('/getPosts', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    PostsData.find({$or: [{ viewers: "all" }, { viewers: "systemadmins" }]}, null, {sort: {_id: -1}}, (err, result) => {
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

router.get('/driverList/:companyID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.params.companyID

    Driver.find({companyID: companyID}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Cannot process Drivers List"})
        }
        else{
            res.send({status: true, result: result})
            // console.log(companyID)
        }
    })
})

router.post('/updateDriverStatus', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const driverID = req.body.driverID
    const status = req.body.status

    Driver.findOneAndUpdate({ userID: driverID }, { status: status }, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Cannot update driver status"})
        }
        else{
            res.send({status: true, message: "Driver status updated"})
            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Driver ${driverID} status updated to ${status}`, "Admin Web App")
        }
    })
})

router.get('/availableRoutes', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    
    RoutesData.find({privacy: true}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Cannot generate routes"})
        }
        else{
            res.send({status: true, result: result})
        }
    })
})

router.post('/assignRoute', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const routeID = req.body.routeID;
    const companyID = req.body.companyID;
    const date = dateGetter();

    const newAssignedRoute = new AssignedRoutes({
        routeID: routeID,
        companyID: companyID,
        dateAssigned: date
    })

    newAssignedRoute.save().then(() => {
        res.send({status: true, message: "Route has been Assigned"})
        postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Route ${routeID} Assigned to Company ${companyID}`, "Admin Web App")
    }).catch((err) => {
        console.log(err)
        res.send({status: false, message: "Cannot assign route"})
    })
})

router.get('/assignedRoutes/:companyID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.params.companyID

    AssignedRoutes.find({companyID: companyID}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Cannot generate assigned routes"})
        }
        else{
            res.send({status: true, result: result})
        }
    })
})

router.post('/addBus', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const busID = `BUS_${makeid(7)}`;
    const companyID = req.body.companyID;
    const driverID = req.body.driverID;
    const busModel = req.body.busModel;
    const plateNumber = req.body.plateNumber;
    const capacity = req.body.capacity

    const processAdd = (busIDPass) => {
        const newBus = new BusData({
            busID: busIDPass,
            companyID: companyID,
            driverID: driverID,
            busModel: busModel,
            plateNumber: plateNumber,
            capacity: capacity
        })

        newBus.save().then(() => {
            res.send({status: true, message: "Bus has been Added"})
            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Add New Bus ${busIDPass} assigned to ${driverID}`, "Admin Web App")
        }).catch((err) => {
            console.log(err)
            res.send({status: false, message: "Cannot Add bus"})
        })
    }

    const checkBusID = (busIDtoCheck) => {
        BusData.find({busID: busIDtoCheck}, (err, result) => {
            if(err){
                console.log(err)
                res.send({status: false, message: "Cannot scan buses"})
            }
            else{
                if(result.length > 0){
                    checkBusID(`BUS_${makeid(7)}`)
                }
                else{
                    processAdd(busIDtoCheck)
                }
            }
        })
    }

    checkBusID(busID)
})

router.get('/getBusList/:companyID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.params.companyID;

    BusData.find({companyID: companyID}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Cannot scan Bus List"})
        }
        else{
            res.send({status: true, result: result})
        }
    })
})

router.get('/countUsers', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    CommuterData.find({}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Cannot count app users"})
        }
        else{
            CompanyRegdata.find({}, (err2, result2) => {
                if(err2){
                    console.log(err2)
                    res.send({status: false, message: "Cannot count companies"})
                }
                else{
                    BusData.find({}, (err3, result3) => {
                        if(err3){
                            console.log(err3)
                            res.send({status: false, message: "Cannot count registered buses"})
                        }
                        else{
                            Driver.find({}, {pass: 0}, (err4, result4) => {
                                if(err4){
                                    console.log(err4)
                                    res.send({status: false, message: "Cannot scan recently added accounts"})
                                }
                                else{
                                    res.send({status: true, result: {
                                        commuter: result.length,
                                        company: result2.length,
                                        buses: result3.length,
                                        recentlyAdded: result4
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

router.post('/deleteAssignedRoute', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.body.companyID;
    const routeID = req.body.routeID;

    AssignedRoutes.deleteOne({companyID: companyID, routeID: routeID}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Error in deleting assigned route"})
        }
        else{
            Driver.updateMany({companyID: companyID}, {status: false}, (err2, result2) => {
                if(err2){
                    console.log(err2)
                    res.send({status: false, message: "Error disabling driver accounts"})
                }
                else{
                    res.send({status: true, message: "Asssigned Route successfully deleted"})
                    postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Delete Assigned Route ${routeID} from Company ${companyID}`, "Admin Web App")
                }
            })
            // console.log(companyID, routeID)
        }
    })
})

router.post('/deleteBus', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const busID = req.body.busID;
    const driverID = req.body.driverID;

    BusData.deleteOne({busID: busID}, (err, result) => {
        if(err){
            console.log(err);
            res.send({status: false, message: "Error deleting bus"})
        }
        else{
            Driver.updateOne({userID: driverID}, { status: false }, (err2, result2) => {
                if(err2){
                    console.log(err2)
                    res.send({status: false, message: `Error disabling ${driverID}`})
                }
                else{
                    res.send({status: true, message: "Bus have been deleted"})
                    postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Delete Bus ${busID} assigned to ${driverID}`, "Admin Web App")
                }
            })
        }
    })
})

router.post('/deleteRoute', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const routeID = req.body.routeID;

    RoutesData.deleteOne({routeID: routeID}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Error deleting route"})
        }
        else{
            res.send({status: true, message: "Route have been deleted"})
            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Delete Route ${routeID}`, "Admin Web App")
        }
    })
})

router.post('/deleteDriver', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const driverID = req.body.driverID;

    Driver.deleteOne({userID: driverID}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Error Deleting Driver"})
        }
        else{
            res.send({status: true, message: "Driver has been deleted"})
            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Delete Bus Driver ${driverID}`, "Admin Web App")
        }
    })
})

router.get('/getAllDrivers', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    Driver.find({}, {email: 0, pass: 0}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Error generating driver's list"})
        }
        else{
            res.send({status: true, result: result})
        }
    })
})

router.get('/getMonthlyActiveStatistics', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    var dateSplit = dateGetter().split("/")[0]

    UserActivities.aggregate([
        { $match: {
            platform: "Commuter App"
        }},
        { $group: {
            _id: "$dateCommited.monthNumber",
            label: { $last: "$dateCommited.monthName"},
            count: { $sum: 1}
        } },
        {$sort: {
            _id: 1
        }}
    ], (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Error generating monthly active statistics"})
        }
        else{
            res.send({status: true, result: result})
        }
    })
})

router.get('/deletePost/:postID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const postID = req.params.postID

    PostsData.deleteOne({postID: postID}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Post deletion error"})
        }
        else{
            res.send({status: true, message: "Post has been deleted"})
            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Delete ${postID} Feed Post`, "Admin Web App")
        }
    })
})

router.get('/deleteCompany/:companyID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.params.companyID

    AssignedRoutes.deleteOne({companyID: companyID}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Unable to delete assigned route"})
        }
        else{
            BusData.deleteMany({companyID: companyID}, (err1, result1) => {
                if(err1){
                    console.log(err1)
                    res.send({status: false, message: "Unable to delete buses data"})
                }
                else{
                    Driver.deleteMany({companyID: companyID}, (err2, result2) => {
                        if(err2){
                            console.log(err2)
                            res.send({status: false, message: "Unable to delete driver accounts"})
                        }
                        else{
                            CompanyRegdata.deleteOne({companyID: companyID}, (err3, result3) => {
                                if(err3){
                                    console.log(err3)
                                    res.send({status: false, message: "Cannot delete Company, only its data"})
                                }
                                else{
                                    res.send({status: true, message: "Company has been Deleted!"})
                                    postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Delete ${companyID} Company Records`, "Admin Web App")
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.get('/deleteCompanyRecords/:companyID', jwtverifier, (req, res) => {
    const id = req.params.decodedID;
    const companyID = req.params.companyID

    AssignedRoutes.deleteOne({companyID: companyID}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Unable to delete assigned route"})
        }
        else{
            BusData.deleteMany({companyID: companyID}, (err1, result1) => {
                if(err1){
                    console.log(err1)
                    res.send({status: false, message: "Unable to delete buses data"})
                }
                else{
                    Driver.deleteMany({companyID: companyID}, (err2, result2) => {
                        if(err2){
                            console.log(err2)
                            res.send({status: false, message: "Unable to delete driver accounts"})
                        }
                        else{
                            res.send({status: true, message: "Company Records has been cleared!"})
                            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Clear ${companyID} Company Data`, "Admin Web App")
                        }
                    })
                }
            })
        }
    })
})

router.post('/updatePost', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    const postID = req.body.postID;
    const title = req.body.title;
    const content = req.body.content;
    const viewers = req.body.viewers;

    PostsData.updateOne({postID: postID}, {title: title, content: content, viewers: viewers}, (err, result) => {
        if(err){
            console.log(err);
            res.send({status: false, message: "Cannot update post"})
        }
        else{
            res.send({status: true, message: "Post has been updated"})
            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Update ${postID} Feed Post`, "Admin Web App")
        }
    })

    // console.log({
    //     postID,
    //     title,
    //     content,
    //     viewers
    // })

    // res.send({status: true})
})

router.post('/updateBusStopData', jwtverifier, (req, res) => {
    const id = req.params.decodedID;

    const busStopID = req.body.busStopID;
    const stationName = req.body.stationName;
    const stationAddress = req.body.stationAddress;

    BusStopsData.updateOne({busStopID: busStopID}, {stationName: stationName, stationAddress: stationAddress}, (err, result) => {
        if(err){
            console.log(err);
            res.send({status: false, message: "Bus Stop Data cannot be updated"})
        }
        else{
            res.send({status: true, message: "Bus Stop Data has been updated"})
            respondToAllBSData()
            postUserActivity(`UA_${makeid(15)}`, "System Admin", id, `Update ${busStopID} Bus Stop Data`, "Admin Web App")
        }
    })

    // console.log({
    //     busStopID,
    //     stationName,
    //     stationAddress
    // })

    // res.send({status: true})
})

router.get('/systemActivities', (req, res) => {
    const id = req.params.decodedID;

    UserActivities.find({}, (err, result) => {
        if(err){
            console.log(err)
            res.send({status: false, message: "Cannot generate System Activities"})
        }
        else{
            res.send({status: true, result: result.reverse()})
        }
    })
})

const postUserActivity = (propID, userType, userID, action, platform) => {

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    UserActivities.findOne({activityID: propID}, (err, result) => {
        if(err){
            console.log(err);
        }
        else{
            if(result == null){
                var dateSplit = dateGetter().split("/")[0] // ex: "03"

                const newUserActivty = new UserActivities({
                    activityID: propID,
                    userType: userType,
                    userID: userID,
                    action: action,
                    dateCommited: {
                        dateRecorded: dateGetter(),
                        timeRecorded: timeGetter(),
                        monthName: labels[dateSplit.split("")[0] == "0"? parseInt(dateSplit.split("")[1]) - 1 : parseInt(dateSplit) - 1],
                        monthNumber: dateSplit.split("")[0] == "0"? parseInt(dateSplit.split("")[1]) : parseInt(dateSplit)
                    },
                    platform: platform
                })

                newUserActivty.save().then(() => {

                }).catch((err) => {
                    console.log(err)
                })
            }
            else{
                postUserActivity(`UA_${makeid(15)}`, userType, userID, action, platform)
            }
        }
    })
}

module.exports = router;