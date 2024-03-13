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
 
 
 const userSchema = {
   // Schema for login info to go into user collection
   name: String,
   email: String,
   password: String,
   friendLists: [String],
   chatGroups: [String]
 };

 module.exports = mongoose.model("User", userSchema);    