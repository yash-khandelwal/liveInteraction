const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const Users = require("./utils/users");
const Questions = require("./utils/questions");
const Polls = require("./utils/polls");
let users = new Users();
let questions = new Questions();
let polls = new Polls();

const router = require("./utils/router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(cors());
app.use(router);

// const chatNamespace = io.of('/chat')
// const questionsNamespace = io.of('/question')

io.on("connect", (socket) => {
  console.log("connected");
  // when new user enters in to the channel
  socket.on("join", ({ userName, displayName, channel }, callback) => {
    const { errors, user } = users.addUser({
      id: socket.id,
      userName: userName,
      displayName: displayName,
      channel: channel,
    });

    if (errors) {
      console.log(errors);
      return callback(errors);
    }
    console.log(user);
    socket.join(user.channel);
    socket.to(user.channel).emit("infoMessage", {
      info: `${user.displayName} joined!`,
    });
    io.to(user.channel).emit("newConnect", {
      user: user,
    });
    io.to(socket.id).emit("channelData", {
      channel: user.channel,
      users: users.getUsersInChannel(user.channel),
    });
    console.log("joined");
    callback();
  });

  // when user send message to the channel
  socket.on("sendChatMessageToChannel", (data, callback) => {
    io.to(data.to).emit("channelMessage", {
      user: data.fromDisplayName,
      text: data.message,
    });
    callback();
  });
  // when presenter publishes a poll to the channel
  socket.on("sendPoll", (data, callback) => {

    const { _id, user, question, options, timestamp } = data;
    let newPoll = {
      _id,
      user,
      question,
      timestamp,
      options
    }
    console.log(newPoll);
    io.to(user.channelId).emit("newPoll", newPoll);
    callback();
  });
  socket.on("vote", ({ pollId, optionId, optionNum }, callback) => {
    console.log("vote triggered!!");
    console.log(pollId, optionId, optionNum);
    // polls.addVote({ id, optionNum });
    // console.log(polls.getPollResults({ id }));
    callback();
  });
  socket.on("voteUpdate", ({ id, prevOptionNum, newOptionNum }, callback) => {
    console.log("voteupdate triggered!!");
    console.log(id, prevOptionNum, newOptionNum);
    // polls.updateVote({ id, prevOptionNum, newOptionNum });
    // console.log(polls.getPollResults({ id }));
    callback();
  });

  // when user send question to the channel
  socket.on("sendQuestionToChannel", (data, callback) => {
    // const ques = questions.addQuestion(data);
    io.to(data.to).emit("channelQuestion", data);
    callback();
  });
  socket.on("sendAnswerToChannel", (data, callback) => {
    // questions.answerQuestion(data.index, data.answer);
    io.to(data.to).emit("channelAnswer", data);
    console.log("fired");
    callback();
  });

  // when user send private message to another user
  socket.on("sendChatMessageToUser", (data, callback) => {
    console.log(data);
    try {
      io.to(data.toSocket).emit("privateMessage", data);
    } catch (err) {
      console.log(err);
    }
    callback();
  });

  // when user go offline from the channel
  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
      return;
    }
    const user = users.getUser(socket.id);
    if (user) {
      console.log(users.users);
      console.log("disconnected");
      users.removeUser(socket.id);
      io.to(user.channel).emit("infoMessage", {
        info: `${user.displayName} has left`,
      });
      io.to(user.channel).emit("userDisconnect", socket.id);
      console.log(users.users);
    }
  });

  // tesing event
  socket.on("test", (message) => {
    console.log(message);
    io.to(socket.id).emit("testAck", true);
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
