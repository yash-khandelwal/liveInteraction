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
app.use(cors());
app.use(router);

const chatNamespace = io.of('/chat')

chatNamespace.on('connect', (socket) => {
    
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
        socket.to(user.channel).emit('infoMessage', {
            info: `${user.displayName} joined!`
        });
        chatNamespace.to(user.channel).emit('newConnect', { 
            user: user 
        });
        chatNamespace.to(socket.id).emit('channelData', {
            channel: user.channel, 
            users: users.getUsersInChannel(user.channel)
        })
        console.log("joined");
        callback();
    });
    
    // when user send message to the channel
    socket.on('sendChatMessageToChannel', (data, callback) => {
        chatNamespace.to(data.to).emit('channelMessage', {user: data.fromDisplayName, text: data.message});
        callback();
    });

    // when user send private message to another user
    socket.on('sendChatMessageToUser', (data, callback) => {
        console.log(data);
        try{
            chatNamespace.to(data.toSocket).emit('privateMessage', data);
        }catch(err){
            console.log(err);
        }
        callback();
    })
    
    // when user go offline from the channel
    socket.on('disconnect', (reason) => {
        if (reason === 'chatNamespace server disconnect') {
            // the disconnectchatNamespacen was initiated by the server, you need to reconnect manually
            socket.connect();
            return;
        }
        const user = users.getUser(socket.id);
        if(user){
            console.log(users.users);
            console.log('disconnected');
            users.removeUser(socket.id);
            chatNamespace.to(user.channel).emit('infoMessage', {
                info: `${user.displayName} has left`
            });
            chatNamespace.to(user.channel).emit('userDisconnect', socket.id);
            console.log(users.users);
        }
    });
})

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`server is running on port: ${PORT}`);
})