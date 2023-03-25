const mongoose = require("mongoose")

const useractivities = mongoose.Schema({
    activityID: {type: mongoose.Schema.Types.Mixed, required: true},
    userType: {type: mongoose.Schema.Types.Mixed, required: true},
    userID: {type: mongoose.Schema.Types.Mixed, required: true},
    action: {type: mongoose.Schema.Types.Mixed, required: true},
    dateCommited: {
        dateRecorded: {type: mongoose.Schema.Types.Mixed, required: true},
        timeRecorded: {type: mongoose.Schema.Types.Mixed, required: true},
        monthName: {type: mongoose.Schema.Types.Mixed, required: true},
        monthNumber: {type: mongoose.Schema.Types.Mixed, required: true}
    },
    platform: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("UserActivities", useractivities, "useractivities" );