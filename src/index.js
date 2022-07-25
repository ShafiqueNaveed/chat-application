const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateTimestamp , generateLocationMessage} = require("./utils/messages")
const {addUsers ,getUser ,removeUser ,getUserInRoom} = require("./utils/users")

const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = socketio(server)
const filter = new Filter()

const publicDirectory = path.join(__dirname , "../public")
app.use(express.static(publicDirectory))

io.on("connection" , (socket)=>{
    console.log("here new webSocket connection comes")
    
    socket.on("join" , ({username , room} ,callback)=>{
        const { error , user} = addUsers ({id:socket.id , username , room})
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit("message", generateTimestamp( "Admin","Welcome!"))
        socket.broadcast.to(user.room).emit("message", generateTimestamp( "Admin",`${user.username} has joined`))
        
        io.emit("roomData" , {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })

    socket.on("sendMessage" , (msg , callback)=>{
        const user = getUser(socket.id)
        if(filter.isProfane(msg)){
            return callback("message contain profanity")
        }
        
        io.to(user.room).emit("message", generateTimestamp( user.username,msg))
        callback()
    })

    socket.on("send-location" , (chord ,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage" , generateLocationMessage( user.username,`https://google.com/maps?q=${chord.latitude},${chord.longitude}`))
        callback()
    })

    socket.on("disconnect" ,()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit("message", generateTimestamp("Admin",`${user.username} has left`))
            io.emit("roomData" , {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }

    })
})

server.listen(port , ()=>{
    console.log("Your app is up and running on " + port)
})
