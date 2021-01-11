import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import ChatApp from "./ChatApp/ChatApp.jsx";
import ChatAll from "./ChatApp/ChatAll/ChatAll";
import PollsApp from "./PollsApp/PollsApp.jsx";
import QnAApp from "./QnAApp/QnAApp.jsx";
import StatSection from "./StatSection/StatSection.jsx";

let socket;
let mp = new Map();

const Channel = ({ location }) => {
  //global states
  const [interaction, setInteraction] = useState("Chat");
  const ENDPOINT = "http://localhost:5001";
  const [users, setUsers] = useState([]);
  const [userData, setuserData] = useState({
    userName: "",
    displayName: "",
    channelId: "",
    role: "",
  });

  //chat states
  const [channelChatMessages, setChannelChatMessages] = useState([]);
  const [sidepannel, setSidepannel] = useState(false);
  const [channelChatMessage, setChannelChatMessage] = useState("");
  const [privateMessages, setPrivateMessages] = useState(new Map());

  //question states
  const [question, setQuestion] = useState(new Map());
  // poll states
  const [polls, setPolls] = useState(new Map());
  const [pollIds, setPollIds] = useState([]);
  const [createPoll, setCreatePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [optionList, setOptionList] = useState([]);

  useEffect(() => {
    const { username, displayname, channel, presenter } = queryString.parse(
      location.search
    );
    console.log(username, displayname, channel, presenter);
    setuserData({
      userName: username,
      displayName: displayname,
      channelId: channel,
      role: presenter === "host",
    });
    socket = io(ENDPOINT);
    socket.on("connection", (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("connected to backend");
      }
    });
    console.log(socket);
    socket.emit(
      "join",
      {
        userName: username,
        displayName: displayname,
        channel: channel,
        role: presenter === "host",
      },
      (err) => {
        if (err) {
          alert(err);
        }
      }
    );
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("newConnect", (data) => {
      mp.set(data.user.id, data.user.userName);
      setUsers((prevUsers) => [...prevUsers, data.user]);
      setPrivateMessages(
        (prev) =>
          new Map([
            ...prev,
            [data.user.userName, { active: true, messages: [], unread: 0 }],
          ])
      );
      // console.log(mp);
    });
    socket.on("userDisconnect", (userId) => {
      mp.delete(userId);
      setUsers((prevUsers) => {
        return prevUsers.filter((user) => user.id !== userId);
      });
      setPrivateMessages((prevPrivateMessages) => {
        prevPrivateMessages.set(mp.get(userId), { active: true, messages: [] });
        return prevPrivateMessages;
      });
      // console.log(mp);
    });
    socket.on("channelMessage", (data) => {
      setChannelChatMessages((prevChatMessages) => {
        return [...prevChatMessages, data];
      });
    });
    // will happen only when client starts streaming
    socket.on("channelData", (data) => {
      var privatemsg = new Map();
      data.users.map((user) => {
        mp.set(user.id, user.userName);
        privatemsg.set(user.userName, {
          active: true,
          messages: [],
          unread: 0,
        });
        return true;
      });
      // console.log(privatemsg);
      setPrivateMessages(privatemsg);
      // console.log("privateMessages: ", privateMessages);
      setUsers(data.users);
      // console.log(mp);
    });
    socket.on("infoMessage", (data) => {
      setChannelChatMessages((prevChatMessages) => {
        return [
          ...prevChatMessages,
          {
            user: "info",
            text: data.info,
          },
        ];
      });
    });
    socket.on("privateMessage", (data) => {
      console.log("aayaa toh");
      console.log(data);
      // console.log(privateMessages);
      setUsers((prevUsers) => {
        let newUsers = [data.from];
        prevUsers = prevUsers.filter((prev) => {
          if (prev.userName !== data.from) {
            return true;
          } else {
            newUsers[0] = prev;
            return false;
          }
        });
        newUsers = [...newUsers, ...prevUsers];
        console.log(newUsers);
        return newUsers;
      });
      setPrivateMessages((prevPrivateMessages) => {
        console.log(prevPrivateMessages);
        let { messages, unread } = prevPrivateMessages.get(data.from);
        console.log(messages, unread);
        // messageArr = messageArr.messages;
        if (!messages) {
          messages = [];
        }
        messages.push({
          user: data.fromDisplayName,
          text: data.message,
        });
        prevPrivateMessages.set(data.from, {
          active: true,
          messages: messages,
          unread: unread + 1,
        });
        // console.log(prevPrivateMessages);
        return new Map(prevPrivateMessages);
      });
      // console.log(privateMessages);
    });
    socket.on("newPoll", (data) => {
      console.log("poll aya aya aya aya");
      setPolls((prevPolls) => {
        prevPolls.set(data.id, { ...data, voted: false });
        console.log(prevPolls.get(data.id));
        return new Map(prevPolls);
      });
      setPollIds((prev) => [...prev, data.id]);
    });
    socket.on("channelQuestion", (data) => {
      // console.log(question)
      setQuestion((prevChatMessages) => {
        prevChatMessages.set(data.id, data);
        return new Map(prevChatMessages);
      });
    });

    socket.on("channelAnswer", (data) => {
      setQuestion((prevQues) => {
        let ques = prevQues.get(data.index);
        ques.answer.push(data.answer);
        prevQues.set(data.index, ques);
        return new Map(prevQues);
      });
    });
  }, []);

  const sendChatMessageToChannel = () => {
    const data = {
      from: userData.userName,
      fromDisplayName: userData.displayName,
      to: userData.channelId,
      message: channelChatMessage,
    };
    socket.emit("sendChatMessageToChannel", data, () => {
      setChannelChatMessage("");
    });
  };

  const sendChatMessageToUser = ({ toSocket, to, message }) => {
    const data = {
      from: userData.userName,
      fromDisplayName: userData.displayName,
      toSocket: toSocket,
      to: to,
      message: message,
    };
    socket.emit("sendChatMessageToUser", data, () => {
      setUsers((prevUsers) => {
        let newUsers = [data.to];
        prevUsers = prevUsers.filter((prev) => {
          if (prev.userName !== data.to) {
            return true;
          } else {
            newUsers[0] = prev;
            return false;
          }
        });
        newUsers = [...newUsers, ...prevUsers];
        console.log(newUsers);
        return newUsers;
      });
      setPrivateMessages((prevPrivateMessages) => {
        console.log(prevPrivateMessages);
        let messageArr = prevPrivateMessages.get(data.to).messages;
        // messageArr = messageArr.messages;
        if (!messageArr) {
          messageArr = [];
        }
        messageArr.push({
          user: data.from,
          text: data.message,
        });
        prevPrivateMessages.set(data.to, {
          active: true,
          messages: messageArr,
          unread: 0,
        });
        console.log(prevPrivateMessages);
        return new Map(prevPrivateMessages);
      });
      console.log("nothing");
    });
  };

  const sendPoll = (pollData) => {
    // console.log(pollData);
    socket.emit(
      "sendPoll",
      {
        user: userData,
        question: pollData.pollQuestion,
        options: pollData.optionList,
      },
      () => {
        console.log("poll publish success");
      }
    );
  };
  const sendVote = (id, optionNum) => {
    socket.emit("vote", { id, optionNum }, () => {
      setPolls((prev) => {
        prev.get(id).voted = optionNum;
        console.log(prev.get(id));
        return new Map(prev);
      });
    });
  };

  const sendVoteUpdate = (id, prevOptionNum, newOptionNum) => {
    console.log("sendVoteUpdate triggered");
    socket.emit("voteUpdate", { id, prevOptionNum, newOptionNum }, () => {
      setPolls((prev) => {
        prev.get(id).voted = newOptionNum;
        console.log(prev.get(id));
        return new Map(prev);
      });
    });
  };

  const sendQuestionToChannel = (formData) => {
    const data = {
      id: uuidv4(),
      from: userData.userName,
      fromDisplayName: userData.displayName,
      to: userData.channelId,
      question: formData,
      answer: [],
      likes: [],
    };
    socket.emit("sendQuestionToChannel", data, () => {});
  };
  const sendAnswer = (index, answer) => {
    const ansobj = {
      answer,
      from: userData.userName,
      display: userData.displayName,
    };
    const data = { index, answer: ansobj, to: userData.channelId };
    console.log(index, answer);
    socket.emit("sendAnswerToChannel", data, () => {});
  };
  const likeQuestion = (index, answer) => {
    const data = { index, id: userData.userName };
    console.log(index, answer);
    socket.emit("sendlikeQuestion", data, () => {});
  };

  return (
    <div>
      <StatSection users={users} />
      <h3>Channel: {userData.channelId}</h3>
      <h3>userName: {userData.userName}</h3>
      <div>
        <button
          onClick={(e) => {
            setInteraction("Chat");
          }}
        >
          Chat
        </button>
        <button
          onClick={(e) => {
            setInteraction("Polls");
          }}
        >
          Polls
        </button>
        <button
          onClick={(e) => {
            setInteraction("QnA");
          }}
        >
          QnA
        </button>
      </div>
      {interaction === "Chat" && (
        <ChatApp
          messages={channelChatMessages}
          message={channelChatMessage}
          setMessage={setChannelChatMessage}
          sendMessageToChannel={sendChatMessageToChannel}
          sendMessageToUser={sendChatMessageToUser}
          users={users}
          privateMessages={privateMessages}
          userData={userData}
          setPrivateMessages={setPrivateMessages}
        />
      )}
      {interaction === "Polls" && (
        <PollsApp
          socket={socket}
          role={true}
          polls={polls}
          publishPoll={sendPoll}
          createPoll={createPoll}
          setCreatePoll={setCreatePoll}
          pollQuestion={pollQuestion}
          setPollQuestion={setPollQuestion}
          optionList={optionList}
          setOptionList={setOptionList}
          pollIds={pollIds}
          sendVote={sendVote}
          sendVoteUpdate={sendVoteUpdate}
        />
      )}
      {interaction === "QnA" && (
        <QnAApp
          role={userData.role}
          question={question}
          sendQuestionToChannel={sendQuestionToChannel}
          sendAnswer={sendAnswer}
        />
      )}

      <div>
        <div
          id="mySidepanel"
          className={`sidepanel ${
            sidepannel ? "sidepanel-open" : "sidepanel-closed"
          }`}
        >
          <div>
            <ul
              className="nav nav-pills mb-3 text-center px-1 justify-content-around"
              id="pills-tab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link active"
                  id="pills-home-tab"
                  data-toggle="pill"
                  href="#pills-home"
                  role="tab"
                  aria-controls="pills-home"
                  aria-selected="true"
                >
                  <i className="far fa-comments" />
                  Chat
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link"
                  id="pills-profile-tab"
                  data-toggle="pill"
                  href="#pills-profile"
                  role="tab"
                  aria-controls="pills-profile"
                  aria-selected="false"
                >
                  <i className="fas fa-poll" />
                  Polls
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link"
                  id="pills-contact-tab"
                  data-toggle="pill"
                  href="#pills-contact"
                  role="tab"
                  aria-controls="pills-contact"
                  aria-selected="false"
                >
                  <i className="far fa-comment-alt" />
                  Q&amp;A
                </a>
              </li>
            </ul>
            <div className="tab-content text-white" id="pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-home"
                role="tabpanel"
                aria-labelledby="pills-home-tab"
              >
                <ul
                  className="nav nav-pills mb-3 justify-content-center"
                  id="pills-tab text-center"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link active text-center"
                      id="pills-public-tab"
                      data-toggle="pill"
                      href="#pills-public"
                      role="tab"
                      aria-controls="pills-public"
                      aria-selected="true"
                      style={{ width: "13rem" }}
                    >
                      Home
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link text-center"
                      id="pills-private-tab"
                      data-toggle="pill"
                      href="#pills-private"
                      role="tab"
                      aria-controls="pills-private"
                      aria-selected="false"
                      style={{ width: "13rem" }}
                    >
                      Profile
                    </a>
                  </li>
                </ul>
                <div className="tab-content" id="pills-tabContent">
                  <div
                    className="tab-pane fade show active px-2"
                    id="pills-public"
                    role="tabpanel"
                    aria-labelledby="pills-public-tab"
                  >
                    <ChatAll
                      messages={channelChatMessages}
                      message={channelChatMessage}
                      setMessage={setChannelChatMessage}
                      sendMessage={sendChatMessageToChannel}
                    />
                  </div>
                  <div
                    className="tab-pane fade"
                    id="pills-private"
                    role="tabpanel"
                    aria-labelledby="pills-private-tab"
                  >
                    Hello123
                  </div>
                </div>
              </div>
              <div
                className="tab-pane fade px-2"
                id="pills-profile"
                role="tabpanel"
                aria-labelledby="pills-profile-tab"
              >
                <br />
                <br />
                <div className="chat-container px-2 mb-2">
                  <div className="justify-content-between py-2 mt-2">
                    <span>Why is cryptocurrency expensive today ?</span>
                  </div>
                  <br />
                  <div className="pl-3">
                    <div className="form-check py-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="exampleRadios"
                        id="exampleRadios1"
                        defaultValue="option1"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="exampleRadios1"
                      >
                        Default radio
                        <span className="mr-4 votenumber"> 240 votes</span>
                      </label>
                    </div>
                    <div className="form-check py-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="exampleRadios"
                        id="exampleRadios2"
                        defaultValue="option2"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="exampleRadios2"
                      >
                        Second default radio
                        <span className="mr-4 votenumber"> 240 votes</span>
                      </label>
                    </div>
                    <div className="form-check py-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="exampleRadios"
                        id="exampleRadios3"
                        defaultValue="option3"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="exampleRadios3"
                      >
                        Disabled radio
                        <span className="mr-4 votenumber"> 240 votes</span>
                      </label>
                    </div>
                  </div>
                  <br />
                  <div className="justify-content-center">
                    <p className="text-center">Show result</p>
                  </div>
                </div>
                <div className="chat-container px-2 mb-2">
                  <div className="justify-content-between py-2 mt-2">
                    <span>Why is cryptocurrency expensive today ?</span>
                  </div>
                  <br />
                  <div className="pl-3">
                    <div className="form-check py-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="radio1"
                        id="exampleRadios1"
                        defaultValue="option1"
                        defaultChecked
                      />
                      <label
                        className="form-check-label"
                        htmlFor="exampleRadios1"
                      >
                        Default radio
                        <span className="mr-4 votenumber"> 240 votes</span>
                      </label>
                    </div>
                    <div className="form-check py-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="radio1"
                        id="exampleRadios2"
                        defaultValue="option2"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="exampleRadios2"
                      >
                        Second default radio
                        <span className="mr-4 votenumber"> 240 votes</span>
                      </label>
                    </div>
                    <div className="form-check py-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="radio1"
                        id="exampleRadios3"
                        defaultValue="option3"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="exampleRadios3"
                      >
                        Disabled radio
                        <span className="mr-4 votenumber"> 240 votes</span>
                      </label>
                    </div>
                  </div>
                  <br />
                  <div className="justify-content-center">
                    <p className="text-center">Show result</p>
                  </div>
                </div>
              </div>
              <div
                className="tab-pane fade px-2"
                id="pills-contact"
                role="tabpanel"
                aria-labelledby="pills-contact-tab"
              >
                <QnAApp
                  role={userData.role}
                  question={question}
                  sendQuestionToChannel={sendQuestionToChannel}
                  sendAnswer={sendAnswer}
                />
              </div>
            </div>
          </div>
        </div>
        <button
          className="openbtn"
          onClick={(e) => {
            setSidepannel(!sidepannel);
          }}
        >
          ☰{" "}
        </button>
        <a href="#!" className="closebtn" onclick="closeNav()">
          ×
        </a>
        <h2>Collapsed Sidepanel</h2>
        <p>Click on the hamburger menu/bar icon to open the sidepanel.</p>
      </div>
    </div>
  );
};

export default Channel;
