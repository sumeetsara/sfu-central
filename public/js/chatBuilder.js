/**BUILD CHAT MSG BUBBLES - RELIES ON friends.css */

function buildChat(chatMsgString, isReciever) {
   //Make the divs and p
   let chatMsgWrapper = document.createElement('div');
   let chatMsgContainer = document.createElement('div');
   let chatMsg = document.createElement('p');

   //Add class names
   chatMsgWrapper.className = "chat-msg-wrapper";
   chatMsgContainer.className = "chat-msg-container";
   chatMsg.className = "chat-msg";

   //Organize the heirarchy
   chatMsgWrapper.append(chatMsgContainer);
   chatMsgContainer.append(chatMsg);

   chatMsg.textContent = chatMsgString;
   if(isReciever) chatMsgWrapper.classList.add('reciever')
   return chatMsgWrapper;
}