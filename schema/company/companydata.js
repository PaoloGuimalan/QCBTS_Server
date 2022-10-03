const mongoose = require("mongoose");

const companydata = mongoose.Schema({
    companyID: {type: mongoose.Schema.Types.Mixed, required: true},
    companyAdminID: {type: mongoose.Schema.Types.Mixed, required: true},
    companyName: {type: mongoose.Schema.Types.Mixed, required: true},
    companyAdmin: {
        firstname: {type: mongoose.Schema.Types.Mixed, required: true},
        lastname: {type: mongoose.Schema.Types.Mixed, required: true}
    },
    status: {type: Boolean, required: true},
    dateRegistered: {type: mongoose.Schema.Types.Mixed, required: true},
    email: {type: mongoose.Schema.Types.Mixed, required: true},
    password: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("CompanyData", companydata, "company");