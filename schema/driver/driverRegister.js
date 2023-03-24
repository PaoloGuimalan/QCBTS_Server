const mongoose = require("mongoose");

const driverRegister = mongoose.Schema({
    userID: {type: mongoose.Schema.Types.Mixed, required: true},
    companyID: {type: mongoose.Schema.Types.Mixed, required: true},
    userType: {type: String, required: true},
    firstName: {type: String, required: true},
    middleName: {type: String, required: true},
    lastName: {type: String, required: true},
    mobileNumber: {type: Number, required: true},
    email: {type: mongoose.Schema.Types.Mixed, required: true},
    pass: {type: mongoose.Schema.Types.Mixed, required: true},
    dlicense: {type: mongoose.Schema.Types.Mixed, required: true},
    age: {type: Number, required: true},
    dateRegistered: {type: mongoose.Schema.Types.Mixed, required: true},
    timeRegistered: {type: mongoose.Schema.Types.Mixed, required: true},
    status: Boolean,
    locationSharing: Boolean
})

module.exports = mongoose.model("Driver", driverRegister, "user_accounts");