const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
        origin: '*'
    }
})

app.use(express.json())
app.use(express.static("client"))

io.on("connection", (socket) => {
    console.log("new client connected");

    socket.on("messages", (message)=> {
        console.log(message);
    })

    socket.on("disconnect", ()=> {
        console.log("user disconnected");
    })
})

server.listen(3000, () => {
    console.log("online on 3000");
})