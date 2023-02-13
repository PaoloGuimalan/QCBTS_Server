const mongoose = require("mongoose");

const assignedRoutes = mongoose.Schema({
    routeID: {type: mongoose.Schema.Types.Mixed, required: true},
    companyID: {type: mongoose.Schema.Types.Mixed, required: true},
    dateAssigned: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("AssignedRoutes", assignedRoutes, "assignedroutes");