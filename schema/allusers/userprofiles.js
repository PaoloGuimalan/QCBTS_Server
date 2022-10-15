const mongoose = require("mongoose");

const userprofilesdata = mongoose.Schema({
    userID: { type: mongoose.Schema.Types.Mixed, required: true },
    userDisplayName: { type: mongoose.Schema.Types.Mixed, required: true },
    preview: { type: mongoose.Schema.Types.Mixed, required: true },
    userType: { type: mongoose.Schema.Types.Mixed, required: true }
})

module.exports = mongoose.model("UserProfilesData", userprofilesdata, "userprofiles");