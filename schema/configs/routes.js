const mongoose = require("mongoose");

const routesdata = mongoose.Schema({
    routeID: {type: mongoose.Schema.Types.Mixed, required: true},
    routeName: {type: mongoose.Schema.Types.Mixed, required: true},
    stationList: {type: Array, required: true},
    routePath: {type: Array, required: true},
    dateAdded: {type: mongoose.Schema.Types.Mixed, required: true},
    addedBy: {type: mongoose.Schema.Types.Mixed, required: true},
    companyID: {type: mongoose.Schema.Types.Mixed, required: true},
    privacy: {type: Boolean, required: true},
    status: {type: Boolean, required: true}
})

module.exports = mongoose.model("RoutesData", routesdata, "routes");