const helpers = require('./helpers')
const db = require('./dbConnection')
const User = require('./models/user')
const ChatGroup = require('./models/chatGroup')


//Store all sockets in memory - memory leak possible
var socketArray = new Array();

// Main listening events for the socket function
function chatServer(io) {
   io.on('connection', socket => {
      intializeSocketConnection(socket);


      socket.on('disconnecting', () => {
         terminateSocketConnection(socket);
      })

      socket.on('message', (msg) => {
         addMessage(msg, socket)
      });
   })
}

//Initialize Socket When it first connects
async function intializeSocketConnection(socket) {
   socketArray.push(socket)
   setChatGroups(socket)
}

//Terminate socket by removing from socketArray and sending offline status to friends
function terminateSocketConnection(socket) {
   terminatingUser = socket.userID
   stillConnected = false;
   //Remove disconnecting socket
      const index = socketArray.indexOf(socket)
      socketArray.splice(index, 1)
  
   //If User still has another tab then set stillConnected to true
   for(i = 0; i < socketArray.length; i++) {
      if(socketArray[i].userID === terminatingUser) {
         stillConnected = true
      }
   }
   if(!stillConnected) {
      console.log(terminatingUser, 'disconnected from chatServer')
      for(let room of socket.rooms) {
         socket.in(room).emit('offline', {name : socket.userID})
      }
   }
}

//Add message to database then emit to all online users
function addMessage(msg, socket) {

   //Add from field to msg
   msg.from = socket.userID;

   //Find where this message is supposed to go and add it to that group in db
   //If no such chatGroup exist, create one - also add this to each users chatgroup list
   chatGroupID = helpers.getGroupID(msg.to, msg.from)
   ChatGroup.findOne({ id: chatGroupID }, function (err, chatGroup) {
      if (chatGroup) {
         chatGroup.messages.push(msg)
         chatGroup.save()
      } else {
         let msgArray = [msg]
         newChatGroup = new ChatGroup({
            id: chatGroupID,
            messages: msgArray
         })
         newChatGroup.save()
         addChatGroupToUser(chatGroupID, msg.to)
         addChatGroupToUser(chatGroupID, msg.from)
      }
   })
   //Emit the new message to all online users so they get the message without refreshing
   socket.in(chatGroupID).emit('message', msg)
}

//Make socket join all the chats user have opened
//IMPORTANT: Only call after setSocketUser
function setChatGroups(socket) {
   //Once socket user is set, let all online friends know this user is online
   //Let the already online friends know that this friend connected
   setSocketUser(socket, function () {
      if (socket.userID) {
         User.findOne({ email: socket.userID }, function (err, user) {
            socket.join(user.chatGroups)
            for(i = 0; i < socketArray.length; i++) {
               for(k = 0; k < user.friendLists.length; k++) {
                  if(user.friendLists[k] === socketArray[i].userID) {
                     socket.emit('online', {name : user.friendLists[k]})
                     socketArray[i].emit('online', {name : socket.userID})
                  }
               }
            }

         })
         
      }
   })
}
//Add userID to socket object
//Callback is supposed to be used to update the online status
function setSocketUser(socket, callback) {
   let id = helpers.parseSessionID(socket);
   db.find('sessions', { _id: id }, function (err, result) {
      if (result) {
         let resultObj = JSON.parse(result[0].session);
         socket.userID = resultObj.userID;
         console.log(socket.userID, ' now joined the chat server')
      } else {
         console.log('socket cannot be correlated to user in the database')
      }
      callback()
   })  
}

function addChatGroupToUser(chatGroupID, userID) {
   User.findOne({ email: userID }, function (err, user) {
      if (user) {
         user.chatGroups.push(chatGroupID)
         user.save();
      }
   })
}


module.exports = chatServer


