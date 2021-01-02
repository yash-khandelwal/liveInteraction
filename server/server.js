const http = require("http");
const express = require("express");
const socketio = require('socket.io');
const cors = require("cors");

const Users = require('./utils/users');
let users = new Users();
const router = require('./utils/router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
// const whitelist = ['http://localhost:3000'];
// const corsOptions = {
//     credentials: true, // This is important.
//     origin: (origin, callback) => {
//         if(whitelist.includes(origin))
//             return callback(null, true)

//         callback(new Error('Not allowed by CORS'));
//     }
// }
app.use(cors());
app.use(router);

io.on('connect', (socket) => {
    
    console.log("connected");
    // when new user enters in to the channel
    socket.on('join', ({userName, displayName, channel}, callback) => {
        const {errors, user} = users.addUser({id: socket.id, userName: userName, displayName: displayName, channel: channel});

        if(errors){
            console.log(errors);
            return callback(errors);
        }
        console.log(user);
        socket.join(user.channel);
        socket.to(user.channel).emit('message', {
            user: 'info', 
            text: `${user.displayName} joined!`
        });
        io.to(user.channel).emit('channelData', { 
            channel: user.channel, 
            users: users.getUsersInChannel(user.channel) 
        });
        console.log("joined");
        callback();
    });
    
    // when user send message to the channel
    socket.on('sendChatMessageToChannel', (message, callback) => {
        const user = users.getUser(socket.id);
        io.to(user.channel).emit('message', {user: user.displayName, text: message});
        callback();
    });
    
    // when user go offline from the channel
    socket.on('disconnect', () => {
        const user = users.getUser(socket.id);
        if(user){
            console.log('disconnected');
            io.to(user.channel).emit('message', {
                user: 'info', 
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

server.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`);
})