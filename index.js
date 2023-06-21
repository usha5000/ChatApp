const redis = require("redis")
let publisher;
let redisClient;
let subscriber;
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

async function iniateRedis() {
    redisClient = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || "localhost",
          port: process.env.REDIS_PORT || "6379",
        },
      });

    redisClient.on('connect', () => {
        console.log('verbindung zu redis hergestellt');
    });
    redisClient.on("error", (error) => console.error(`Error : ${error}`));

    await redisClient.connect();
    
    subscriber = redisClient.duplicate()
    await subscriber.connect()

    publisher = redisClient.duplicate()
    await publisher.connect()

    await subscriber.subscribe('newMessage', getMessage)
    await subscriber.subscribe('newUser', getUser)
      
}

async function getUser(user) {
    let userKeys = await redisClient.keys('*')

    let users = [];
    for (let i = 0; i < userKeys.length; i++) {
        let user = await redisClient.get(userKeys[i]);
        if (user) {
            users.push(JSON.parse(user));
        }
    }

    io.sockets.emit('messages', users)

    console.log(userKeys);
    console.log(users);
}

function getMessage(message) {
    let parsed = JSON.parse(message)
    io.sockets.emit('messages', parsed)
}

io.on("connection", (socket) => {
    console.log("new client connected");
    socket.on("messages", (message)=> {
        switch (message.type) {
            case "user":
                message.socketId = socket.id

                redisClient.set(`user: ${message.socketId}`, JSON.stringify(message))
                publisher.publish('newUser', JSON.stringify(message))
                break;
            case "message":
                publisher.publish('newMessage', JSON.stringify(message))
                break;
            default:
                break;
        }        
    })

    socket.on("disconnect", async ()=> {
            console.log('user disconnected');
            redisClient.del(`user: ${socket.id}`)
            let key = await redisClient.keys('*')
            console.log(key);
            let users = []
            for (let i = 0; i < key.length; i++){
                let user = await redisClient.get(key[i]);
                if (user) {
                    users.push(JSON.parse(user));
                } 
            }
            io.sockets.emit('messages', users)
    })
})



server.listen(3000, () => {
    iniateRedis()
    console.log("online on 3000");
})