const mongoose = require("mongoose");
const advancedOptions = {
   useNewUrlParser: true,
   useUnifiedTopology: true
 }
mongoose.connect("mongodb+srv://admin-sumeet:test123@cluster0.qr0rd.mongodb.net/sfucentralDB", advancedOptions);

function find (name, query, cb) {
   mongoose.connection.db.collection(name, function (err, collection) {
      collection.find(query).toArray(cb);
  });
}


module.exports = {mongoose, find, advancedOptions};