// library modules
require('dotenv').config()
const uuidv4 = require('uuid/v4')
const express = require('express')
const moment = require('moment')
const http = require('http')
const port = process.env.PORT || 5150
require('dotenv').config()

const app = express()
//const io = require('socket.io')(server, {wsEngine: 'ws'})
//const socketIO = require('socket.io')



// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See
// http://expressjs.com/api#app-settings for more details.
app.enable('trust proxy');
// Add a handler to inspect the req.secure flag (see
// http://expressjs.com/api#req.secure). This allows us
// to know whether the request was via http or https.
app.use(function (req, res, next) {
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url);
    }
});
app.use(express.static('public'))

const server = http.createServer(app)
const io = require('socket.io')(server, {wsEngine: 'ws'})

let colors = [
    "#ef9a9a",
    "#e57373",
    "#ef5350",
    "#f44336",
    "#e53935",
    "#d32f2f",
    "#c62828",
    "#b71c1c",
    "#ff8a80",
    "#ff5252",
    "#ff1744",
    "#d50000",
    "#f48fb1",
    "#f06292",
    "#ec407a",
    "#e91e63",
    "#d81b60",
    "#c2185b",
    "#ad1457",
    "#880e4f",
    "#ff80ab",
    "#ff4081",
    "#f50057",
    "#c51162",
    "#ba68c8",
    "#ab47bc",
    "#9c27b0",
    "#8e24aa",
    "#7b1fa2",
    "#6a1b9a",
    "#4a148c",
    "#e040fb",
    "#d500f9",
    "#aa00ff",
    "#b39ddb",
    "#9575cd",
    "#7e57c2",
    "#673ab7",
    "#5e35b1",
    "#512da8",
    "#4527a0",
    "#311b92",
    "#7c4dff",
    "#651fff",
    "#6200ea",
    "#7986cb",
    "#5c6bc0",
    "#3f51b5",
    "#3949ab",
    "#303f9f",
    "#283593",
    "#1a237e",
    "#8c9eff",
    "#536dfe",
    "#3d5afe",
    "#304ffe",
    "#64b5f6",
    "#42a5f5",
    "#2196f3",
    "#1e88e5",
    "#1976d2",
    "#1565c0",
    "#0d47a1",
    "#82b1ff",
    "#448aff",
    "#2979ff",
    "#2962ff",
    "#4fc3f7",
    "#29b6f6",
    "#03a9f4",
    "#039be5",
    "#0288d1",
    "#0277bd",
    "#01579b",
    "#40c4ff",
    "#00b0ff",
    "#0091ea",
    "#4dd0e1",
    "#26c6da",
    "#00bcd4",
    "#00acc1",
    "#0097a7",
    "#00838f",
    "#006064",
    "#00b8d4",
    "#4db6ac",
    "#26a69a",
    "#009688",
    "#00897b",
    "#00796b",
    "#00695c",
    "#004d40",
    "#1de9b6",
    "#00bfa5",
    "#81c784",
    "#66bb6a",
    "#4caf50",
    "#43a047",
    "#388e3c",
    "#2e7d32",
    "#1b5e20",
    "#00e676",
    "#00c853",
    "#9ccc65",
    "#8bc34a",
    "#7cb342",
    "#689f38",
    "#558b2f",
    "#33691e",
    "#76ff03",
    "#64dd17",
    "#d4e157",
    "#cddc39",
    "#c0ca33",
    "#afb42b",
    "#9e9d24",
    "#827717",
    "#aeea00",
    "#ffee58",
    "#fdd835",
    "#fbc02d",
    "#f9a825",
    "#f57f17",
    "#ffd600",
    "#ffca28",
    "#ffc107",
    "#ffb300",
    "#ffa000",
    "#ff8f00",
    "#ff6f00",
    "#ffd740",
    "#ffc400",
    "#ffab00",
    "#ffb74d",
    "#ffa726",
    "#ff9800",
    "#fb8c00",
    "#f57c00",
    "#ef6c00",
    "#e65100",
    "#ffab40",
    "#ff9100",
    "#ff6d00",
    "#ff8a65",
    "#ff7043",
    "#ff5722",
    "#f4511e",
    "#e64a19",
    "#d84315",
    "#bf360c",
    "#ff9e80",
    "#ff6e40",
    "#ff3d00",
    "#dd2c00",
    "#a1887f",
    "#8d6e63",
    "#795548",
    "#6d4c41",
    "#5d4037",
    "#4e342e",
    "#3e2723",
    "#757575",
    "#616161",
    "#424242",
    "#607d8b",
    "#546e7a",
    "#455a64",
    "#37474f",
    "#263238"
]
let rooms = []
let names = []
let roomString = ''
let nameString = ''
let exists = false
let roomExists = false

// client connection here
io.on('connection', (socket) => {
    io.emit('currentRoomsAndUsers', {rooms: roomString, users: nameString, currentRooms: rooms, currentUsers: names})
    // client sent server 'join' message using room to join
    socket.on('join', (clientData) => {
        let userColor = colors[Math.floor(Math.random() * 168) + 1]
        console.log(`data from new client --> name: ${clientData.chatName} room: ${clientData.roomName}`)
        names.forEach(name => {
            if (name.name === clientData.chatName) {
                io.to(socket.id).emit('nameexists', {})
                exists = true;
                socket.disconnect()
            }
        })
        rooms.forEach(room => {
            if (room.room === clientData.roomName) {
                roomExists = true;
            }
        })
        if (!roomExists) {
            rooms.push({key: uuidv4(), room: clientData.roomName})
            if (!roomString.includes(clientData.roomName))
                roomString += clientData.roomName + ", "
        }
        if (!exists) {
            names.push({name: clientData.chatName, room: clientData.roomName})
            socket.join(clientData.roomName)
            if (!nameString.includes(clientData.chatName))
                nameString += clientData.chatName + ", "
            io.to(socket.id).emit('welcome', {
                from: 'Admin', room: clientData.roomName, text: `Welcome, ${clientData.chatName}!`,
                id: socket.id, color: '#000', createdAt: moment().format('hh:mm:ss a')
            })
            socket.broadcast.to(clientData.roomName).emit('joined', {
                from: 'Admin', room: clientData.roomName, text: `${clientData.chatName} has joined.`,
                color: '#000', createdAt: moment().format('hh:mm:ss a')
            }) // send message to existing users in room
            io.emit('currentRoomsAndUsers', {
                rooms: roomString,
                users: nameString,
                currentRooms: rooms,
                currentUsers: names
            })
        }
        socket.on('createMessage', (messageData) => {
            io.to(clientData.roomName).emit('messageSent', {
                from: messageData.from,
                room: clientData.room,
                text: messageData.text,
                id: socket.id,
                color: userColor,
                createdAt: moment().format('hh:mm:ss a')
            })
        })
        socket.on('typing', (typingData) => {
            socket.broadcast.to(clientData.roomName).emit('messageTyping', {
                    name: typingData.userName,
                    msg: typingData.message,
                    id: socket.id
                }
            )
        })
        socket.on('isLeaving', (leavingData) => {
            for (let i = 0; i < names.length; i++) {
                if (names[i].name === leavingData.chatName) {
                    names.splice(i, 1)
                    break;
                }
            }
            nameString = nameString.replace(`${leavingData.chatName}, `, "")
            io.emit('currentRoomsAndUsers', {
                rooms: roomString,
                users: nameString,
                currentRooms: rooms,
                currentUsers: names
            })
            socket.leave(leavingData.roomName, function (err) {
                console.log(err)
                io.emit('currentRoomsAndUsers', {
                    rooms: roomString,
                    users: nameString,
                    currentRooms: rooms,
                    currentUsers: names
                })
            })
            if (io.sockets.adapter.rooms[leavingData.roomName] === undefined) {
                let index = rooms.indexOf(leavingData.roomName)
                rooms.splice(index, 1)
                io.emit('currentRoomsAndUsers', {
                    rooms: roomString,
                    users: nameString,
                    currentRooms: rooms,
                    currentUsers: names
                })
            }
            socket.disconnect()
        })
        socket.on('disconnect', () => {
            for (let i = 0; i < names.length; i++) {
                if (names[i].name === clientData.chatName) {
                    names.splice(i, 1)
                }
            }
            if (io.sockets.adapter.rooms[clientData.roomName] === undefined) {
                let index = rooms.indexOf(clientData.roomName)
                rooms.splice(index, 1)
                io.emit('currentRoomsAndUsers', {
                    rooms: roomString,
                    users: nameString,
                    currentRooms: rooms,
                    currentUsers: names
                })
            }
            io.to(clientData.roomName).emit('messageSent', {
                from: 'Admin',
                room: clientData.roomName,
                text: `${clientData.chatName} has disconnected`,
                id: socket.id,
                color: '#000',
                createdAt: moment().format('hh:mm:ss a')
            })
            io.emit('currentRoomsAndUsers', {
                rooms: roomString,
                users: nameString,
                currentRooms: rooms,
                currentUsers: names
            })
            nameString = nameString.replace(`${clientData.chatName}, `, "")
        })
        exists = false
        roomExists = false
    })
})

// home page
app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dirname + '/public'})
})

server.listen(port, () => {
    console.log(`starting on port ${port}`)
})
