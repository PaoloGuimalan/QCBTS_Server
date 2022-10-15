const mongoose = require("mongoose");

const conversationdata = mongoose.Schema({
    conversationID: { type: mongoose.Schema.Types.Mixed, required: true },
    contentID: { type: mongoose.Schema.Types.Mixed, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    contentType: { type: mongoose.Schema.Types.Mixed, required: true },
    contentTime: { type: mongoose.Schema.Types.Mixed, required: true },
    contentDate: { type: mongoose.Schema.Types.Mixed, required: true },
    from: {
        userID: { type: mongoose.Schema.Types.Mixed, required: true },
        userType: { type: mongoose.Schema.Types.Mixed, required: true }
    },
    to: {
        userID: { type: mongoose.Schema.Types.Mixed, required: true },
        userType: { type: mongoose.Schema.Types.Mixed, required: true }
    }
})

module.exports = mongoose.model("ConversationData", conversationdata, "messages");