const mongoose = require("mongoose");

const postsdata = mongoose.Schema({
    postID: { type: mongoose.Schema.Types.Mixed, required: true },
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    preview: { type: mongoose.Schema.Types.Mixed, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    viewers: { type: mongoose.Schema.Types.Mixed, required: true },
    date: { type: mongoose.Schema.Types.Mixed, required: true },
    time: { type: mongoose.Schema.Types.Mixed, required: true }
})

module.exports = mongoose.model("PostsData", postsdata, "posts");