const socket = io()

function sendMessage() {
    let input = document.getElementById('message')
    let username = document.getElementById('username')
    let message = {
        user: username.value,
        message: input.value
    }

    let json = JSON.stringify(message)
    console.log(json);
    socket.emit("messages", json)
}