const express = require('express')
const chatRoutes = express.Router()

const ChatGroup = require('../models/chatGroup')
const helpers = require('../helpers')

chatRoutes.post("/friendChats", function (req, res) {
   ChatGroup.findOne({id : helpers.getGroupID(req.session.userID, req.body.chatID)}, function(err, chatGroup) {
     if(chatGroup) {
       res.json(chatGroup.messages)
 
     } else {
       res.json({})
     }
   })
 });

module.exports = chatRoutes;
 