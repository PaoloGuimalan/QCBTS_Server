const mongoose = require("mongoose");

const companyRegdata = mongoose.Schema({
    companyID: {type: mongoose.Schema.Types.Mixed, required: true},
    companyName: {type: mongoose.Schema.Types.Mixed, required: true},
    companyAddress: {type: mongoose.Schema.Types.Mixed, required: true},
    companyNumber: {type: mongoose.Schema.Types.Mixed, required: true},
    email: {type: mongoose.Schema.Types.Mixed, required: true},
    dateRegistered: {type: mongoose.Schema.Types.Mixed, required: true},
    preview: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("CompanyRegData", companyRegdata, "companylist");