const socket = io()

function guidGenerator() {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  }

const browserId = guidGenerator()

function sendUserData() {
    let username = "new Client"
    document.getElementById("username").value = username

    let userObject = {
        type: "user",
        username: username,
    }
    socket.emit('messages', userObject)
}


function changeUsername() {
    let newUsername = document.getElementById('username').value

    if (newUsername === "") return;

    let userObject = {
        type: "user",
        username: newUsername,
    }
    socket.emit('messages', userObject)
    console.log(userObject);
}

function sendMessage() {
    let input = document.getElementById('message')
    let username = document.getElementById('username')
    let message = {
        username: username.value,
        type: "message",
        browserId: browserId,
        date: new Date().toLocaleTimeString(),
        message: input.value
    }

    socket.emit("messages", message)

    input.value = ''
}

function addMessage(data) {
    let messageBox = document.getElementById('messagebox')

    let messageContainer = document.createElement('div')
    messageContainer.classList.add("messageContainer")

    let message = document.createElement('div')
    message.classList.add("message")

    let nameTag = document.createElement('p')

    if (data.browserId == browserId) {
        messageContainer.classList.add('myMessage')
        nameTag.innerHTML = data.username + ' (you)'
    } else {
        messageContainer.classList.add('clientMessage')
        nameTag.innerHTML = data.username
    }

    let timeTag = document.createElement('p')
    timeTag.innerHTML = data.date

    let messageTag = document.createElement('p')
    messageTag.innerHTML = data.message

    message.appendChild(nameTag)
    message.appendChild(timeTag)
    message.appendChild(messageTag)

    messageContainer.appendChild(message)

    messageBox.appendChild(messageContainer)
    messageBox.scrollTop = messageBox.scrollHeight;
}

socket.on("messages", (data) => {
    if (data.type === 'message') {
        console.log("type is message", data);
        addMessage(data)

    } 
    
    else {
        let userBox = document.getElementById('onlineUserbox')
        userBox.innerHTML = ''
        console.log("type is user", data);
        for (let client of data) {
            let createUser = document.createElement('p')
            userBox.appendChild(createUser)
            createUser.innerHTML = `🟢${client.username}`
        }

    }
    
})

window.onload = sendUserData()