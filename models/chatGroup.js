const dbConnection = require('../dbConnection')
const mongoose = dbConnection.mongoose

const msg = {
   to: String,
   from: String,
   msgString: String,
   date: Date
 }
 const chatSchema = {
   id: String,
   messages: [msg]
 }


 module.exports = mongoose.model("chatGroup", chatSchema);    