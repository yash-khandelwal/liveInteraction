const http = require("http");
const express = require("express");
const socketio = require('socket.io');
const cors = require("cors");

const Users = require('./utils/users');
let users = new Users();
const router = require('./utils/router');

const app = express();
const server = http.createServer(app);
const io = socketio(server,{
    path: '/socket.io',
    maxHttpBufferSize: 10000,
    cookie: false
});
const whitelist = ['http://localhost:3000'];
const corsOptions = {
    credentials: true, // This is important.
    origin: (origin, callback) => {
        if(whitelist.includes(origin))
            return callback(null, true)
        callback(new Error('Not allowed by CORS'));
    }
}
app.use(cors(corsOptions));
app.use(router);

io.on('connect', (socket) => {
    
    console.log("connected");
    // when new user enters in to the channel
    socket.on('join', ({userName, displayName, channel}, callback) => {
        const {error, user} = users.addUser({id: socket.id, userName, displayName, channel});
        if(error){
            return callback(error);
        }
        socket.join(user.channel);
        socket.emit('message', {
            user: 'admin', 
            text: `${user.displayName} joined!`
        });
        io.to(user.channel).emit('channelData', { 
            channel: user.channel, 
            users: users.getUsersInChannel(user.channel) 
        });
        console.log("joined");
        callback();
    });
    
    // when user send message in the channel
    socket.on('sendMessage', (message, callback) => {
        const user = users.getUser(socket.id);
        io.to(user.channel).emit('message', {user: user.displayName, text: message});
        callback();
    });
    
    // when user go offline from the channel
    socket.on('disconnect', () => {
        const user = users.getUser(socket.id);
        if(user){
            io.to(user.channel).emit('message', {
                user: 'admin', 
                text: `${user.displayName} has left`
            });
            io.to(user.channel).emit('channelData', {
                channel: user.channel,
                users: users.getUsersInChannel(user.channel)
            });
        }
    });
})

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`);
})