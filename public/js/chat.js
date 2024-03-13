

const socket = io();

let reciever = "";
let chatInfo = new Object();


var form = document.getElementsByClassName('msg')[0]
var input = document.getElementsByClassName('msg-box')[0];
var chatContainer = document.getElementById('chat-container')
var activeFriend;
var friends = document.querySelector('.friends-box').childNodes;

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('message', { to: reciever, msgString: input.value, date: new Date() });
    chatContainer.append(buildChat(input.value, false))
    chatContainer.scrollTop = chatContainer.scrollHeight;
    input.value = ""
  }

});

socket.on('message', message => {
  console.log('message recieved')
  if(message.from === reciever) {
    chatContainer.append(buildChat(message.msgString, true))
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
})

socket.on('online', message => {
  friends.forEach(element => {
    if(element.className === 'friend-name-box') {
      let friendName = element.querySelector('.name')
      if(friendName.innerHTML === message.name) {
        let friendOnlineStatus = element.querySelector('.friend-online-status')
        friendOnlineStatus.classList.add('friend-active')
      }
    }
  })
})

socket.on('offline', message => {
  friends.forEach(element => {
    if(element.className === 'friend-name-box') {
      let friendName = element.querySelector('.name')
      if(friendName.innerHTML === message.name) {
        let friendOnlineStatus = element.querySelector('.friend-online-status')
        friendOnlineStatus.classList.remove('friend-active')
      }
    }
  })
})
function loadFriendChats(element) {
  if(activeFriend != null) activeFriend.classList.remove('active-friend')
  activeFriend = element
  activeFriend.classList.add('active-friend')
  var msgInputContainer = document.querySelector('.msg-input-container')
  var help = document.querySelector('.default')
  help.classList.add('hide')
  msgInputContainer.classList.add('show')
  let nameElement = element.querySelector('.name')
  if (reciever != nameElement.innerHTML) {
    chatContainer.innerHTML = "";
    reciever = nameElement.innerHTML
    getChats(reciever);
    
  }
  
}

function getChats(friendName) {
  fetch('https://mysterious-earth-79568.herokuapp.com/friendChats', {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "chatID": friendName
    })
  })
    .then(response => response.json())
    .then(data => {
      loadChatsInDom(data);
    })
}

function loadChatsInDom(data) {
  for (i = 0; i < data.length; i++) {
    if (data[i].from === reciever) {
      chatContainer.append(buildChat(data[i].msgString, true))
    } else {
      chatContainer.append(buildChat(data[i].msgString, false))
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}