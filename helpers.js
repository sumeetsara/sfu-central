const cookie = require("cookie");
var CryptoJS = require("crypto-js");
//Given a socket, parse express-session id from the cookie inside header
function parseSessionID(socket) {
   const cookies = cookie.parse(socket.request.headers.cookie || "");
   const idRaw = cookies['connect.sid'] + "" //Convert to string

   //Get just the session id and strip all other info
   const id = idRaw.substring(2, idRaw.indexOf('.'));
   return id;
}

//Very very low chance ID is not unique
function getGroupID(one, two) {
   if((one + two) > (two + one)) {
      return CryptoJS.SHA256(one + two).toString();
   } else {
      return CryptoJS.SHA256(two + one).toString();
   }
}
module.exports = {parseSessionID, getGroupID}