const mongoose = require("mongoose");
const schema = new mongoose.Schema({
    username: String, 
    pin: String, 
    id: String // sessionID
})

module.exports = mongoose.model("User", schema);