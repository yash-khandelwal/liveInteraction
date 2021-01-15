import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import axios from "axios";

import ChatApp from "./ChatApp/ChatApp.jsx";
import ChatAll from "./ChatAll";
import PollsApp from "./PollsApp.jsx";
import QnAApp from "./QnAApp.jsx";
import StatSection from "./StatSection.jsx";
import ChatPrivate from "./PrivateChat";

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

  const axiosConfig = {
    headers: {
      "Content-type": "application/json",
    },
  };

  useEffect(() => {
    const {
      username,
      displayname,
      channel,
      presenter,
      token,
      userId,
    } = queryString.parse(location.search);
    console.log(token);
    if (token) {
      axios.defaults.headers.common["x-auth"] = token;
    } else {
      delete axios.defaults.headers.common["x-auth"];
    }

    console.log(username, displayname, channel, presenter);
    setuserData({
      userId,
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
    async function fetchData() {
      const res = await axios.get(
        `http://localhost:5000/api/channelInteraction/${channel}/qna/`
      );
      const questionMap = new Map();
      console.log(res.data);
      res.data.map((ques) => {
        questionMap.set(ques.qna._id, ques.qna);
        return null;
      });
      setQuestion(questionMap);
    }
    fetchData();
    async function fetchPolls() {
      const allPollsRes = await axios.get(
        `http://localhost:5000/api/channelInteraction/${channel}/poll/`
      );
      console.log(allPollsRes.data);
      const pollsMap = new Map();
      await allPollsRes.data.map((poll) => {
        if (poll.poll) {
          pollsMap.set(poll.poll._id, {
            _id: poll.poll._id,
            user: {
              _id: poll.poll.createdByUserId._id,
              userName: poll.poll.createdByUserId.userName,
              displayName: poll.poll.createdByUserId.userDisplayName,
              role: poll.poll.createdByUserId.role,
            },
            question: poll.poll.questionText,
            timestamp: poll.poll.timestamp,
            options: poll.poll.options.map((option) => {
              return {
                num: option.option.num,
                text: option.option.text,
                votes: 0,
                _id: option.option._id,
              };
            }),
          });
        }
        return null;
      });
      setPolls(pollsMap);
    }

    fetchPolls();

    socket.emit(
      "join",
      {
        userName: username,
        displayName: displayname,
        channel: channel,
        role: presenter,
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
      setPrivateMessages(
        (prev) =>
          new Map([
            ...prev,
            [data.user.userName, { active: true, messages: [], unread: 0 }],
          ])
      );
      setUsers((prevUsers) => [...prevUsers, data.user]);
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
        prevPolls.set(data._id, { ...data, voted: false });
        console.log(prevPolls.get(data._id));
        return new Map(prevPolls);
      });
      setPollIds((prev) => [...prev, data._id]);
    });
    socket.on("channelQuestion", (data) => {
      // console.log(question)
      setQuestion((prevChatMessages) => {
        prevChatMessages.set(data._id, data);
        return new Map(prevChatMessages);
      });
    });

    socket.on("channelAnswer", (data) => {
      setQuestion((prevQues) => {
        let ques = prevQues.get(data.index);
        ques.answers.push({
          answer: { answeredBy: data.answeredBy, answerText: data.answerText },
        });
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

  const sendPoll = async (pollData) => {
    console.log(pollData);
    let data = {
      questionText: pollData.pollQuestion,
    };
    try {
      const pollQuestionRes = await axios.post(
        `http://localhost:5000/api/channelInteraction/${userData.channelId}/poll`,
        data,
        axiosConfig
      );
      console.log(pollQuestionRes.data);
      const options = [];
      for (let i = 0; i < pollData.optionList.length; i++) {
        data = {
          num: i,
          text: pollData.optionList[i],
        };
        const pollOptionRes = await axios.post(
          `http://localhost:5000/api/channelInteraction/${userData.channelId}/poll/${pollQuestionRes.data._id}/option`,
          data,
          axiosConfig
        );
        console.log(pollOptionRes.data);
        options.push({
          num: pollOptionRes.data.num,
          text: pollOptionRes.data.text,
          votes: 0,
          _id: pollOptionRes.data._id,
        });
      }
      console.log(options);
      socket.emit(
        "sendPoll",
        {
          _id: pollQuestionRes.data._id,
          user: {
            _id: pollQuestionRes.data.createdByUserId,
            userName: userData.userName,
            displayName: userData.displayName,
            role: userData.role,
            channelId: userData.channelId,
          },
          question: pollQuestionRes.data.questionText,
          timestamp: pollQuestionRes.data.timestamp,
          options: options,
        },
        () => {
          console.log("poll publish success");
        }
      );
    } catch (err) {
      console.log(err);
    }
  };
  const sendVote = async (pollId, optionId, optionNum) => {
    try {
      const pollOptionVoteRes = await axios.post(
        `http://localhost:5000/api/channelInteraction/${userData.channelId}/poll/${pollId}/vote/${optionNum}`,
        {},
        axiosConfig
      );
      console.log(pollOptionVoteRes);
      if (pollOptionVoteRes.data.message === "successful") {
        // vote successfull
        socket.emit("vote", { pollId, optionId, optionNum }, () => {
          setPolls((prev) => {
            prev.get(pollId).voted = optionNum;
            console.log(prev.get(pollId));
            return new Map(prev);
          });
        });
      } else if (pollOptionVoteRes.data.message === "already voted") {
        // voted already
        console.log(
          "already voted dude what do you want??? you intentions are suspicious... XD"
        );
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  // const sendVoteUpdate = (id, prevOptionNum, newOptionNum) => {
  //   console.log("sendVoteUpdate triggered");
  //   socket.emit("voteUpdate", { id, prevOptionNum, newOptionNum }, () => {
  //     setPolls((prev) => {
  //       prev.get(id).voted = newOptionNum;
  //       console.log(prev.get(id));
  //       return new Map(prev);
  //     });
  //   });
  // };

  const sendVoteUpdate = async ({
    pollId,
    prevOptionId,
    prevOptionNum,
    newOptionId,
    newOptionNum,
  }) => {
    try {
      console.log({
        pollId,
        prevOptionId,
        prevOptionNum,
        newOptionId,
        newOptionNum,
      });
      const pollOptionUnvoteRes = await axios.delete(
        `http://localhost:5000/api/channelInteraction/${userData.channelId}/poll/${pollId}/option/${prevOptionId}`,
        {},
        axiosConfig
      );
      console.log(pollOptionUnvoteRes);
      const pollOptionVoteRes = await axios.post(
        `http://localhost:5000/api/channelInteraction/${userData.channelId}/poll/${pollId}/option/${newOptionId}`,
        {},
        axiosConfig
      );
      console.log(pollOptionVoteRes);
      if (pollOptionVoteRes.data.message === "successful") {
        // vote successfull
        socket.emit(
          "voteUpdate",
          { id: pollId, prevOptionNum, newOptionNum },
          () => {
            setPolls((prev) => {
              prev.get(pollId).voted = newOptionNum;
              console.log(prev.get(pollId));
              return new Map(prev);
            });
          }
        );
      } else if (pollOptionVoteRes.data.message === "not voted") {
        // voted already
        console.log(
          "already voted dude what do you want??? you intentions are suspicious... XD"
        );
      } else {
        console.log(pollOptionUnvoteRes.data);
        console.log(pollOptionVoteRes.data);
        console.log("other cases!");
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const sendQuestionToChannel = async (formData) => {
    const data = {
      publishedByUserId: userData.userName,
      questionText: formData,
    };

    try {
      const res = await axios.post(
        `http://localhost:5000/api/channelInteraction/${userData.channelId}/qna`,
        data,
        axiosConfig
      );
      console.log(res.data);
      socket.emit(
        "sendQuestionToChannel",
        { ...res.data, to: userData.channelId },
        () => {}
      );
    } catch (error) {
      console.log(error.message);
    }
  };
  const sendAnswer = async (index, answer) => {
    const data = {
      answerText: answer,
      answeredBy: userData.userName,
    };

    try {
      const res = await axios.post(
        `http://localhost:5000/api/channelInteraction/${userData.channelId}/qna/${index}/answer`,
        data,
        axiosConfig
      );
      socket.emit(
        "sendAnswerToChannel",
        { ...res.data, to: userData.channelId, index },
        () => {}
      );
    } catch (error) {
      console.log(error.message);
    }
  };
  const likeQuestion = async (index) => {
    const data = { index, id: userData.userName };
    try {
      const res = await axios.post(
        `http://localhost:5000/api/channelInteraction/${userData.channelId}/qna/${index}/like`,
        data,
        axiosConfig
      );
      console.log(res.data);
      setQuestion((prevQues) => {
        let ques = prevQues.get(data.index);
        ques.likes.push({ likedBy: res.data.message });
        prevQues.set(data.index, ques);
        return new Map(prevQues);
      });

      // socket.emit("sendLiketochannel", {...res.data , to:userData.channelId}, () => {});
    } catch (error) {
      console.log(error.message);
    }
    // socket.emit("sendlikeQuestion", data, () => {});
  };

  const unlikeQuestion = async (index) => {
    const data = { index, id: userData.userName };
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/channelInteraction/${userData.channelId}/qna/${index}/like`,
        data,
        axiosConfig
      );
      console.log(res.data);
      // socket.emit("sendLiketochannel", {...res.data , to:userData.channelId}, () => {});
      setQuestion((prevQues) => {
        let ques = prevQues.get(data.index);
        ques.likes.filter((like) => like.likedBy !== res.data.message);
        prevQues.set(data.index, ques);
        return new Map(prevQues);
      });
    } catch (error) {
      console.log(error.message);
    }
    // socket.emit("sendlikeQuestion", data, () => {});
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
      {interaction === "Polls" && <p> Check Side</p>}
      {interaction === "QnA" && <p>Check sidepannel</p>}

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
                      Public
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
                      Attendee
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
                    <ChatPrivate
                      users={users}
                      sendMessage={sendChatMessageToUser}
                      privateMessages={privateMessages}
                      userData={userData}
                      setPrivateMessages={setPrivateMessages}
                    />
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
                <PollsApp
                  socket={socket}
                  role={userData.role}
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
              </div>
              <div
                className="tab-pane fade px-2"
                id="pills-contact"
                role="tabpanel"
                aria-labelledby="pills-contact-tab"
              >
                <QnAApp
                  role={userData.role}
                  userId={userData.userId}
                  question={question}
                  sendQuestionToChannel={sendQuestionToChannel}
                  sendAnswer={sendAnswer}
                  likeQuestion={likeQuestion}
                  unlikeQuestion={unlikeQuestion}
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
        {/* <a href="#!" className="closebtn" onClick="closeNav()">
          ×
        </a> */}
        <h2>Collapsed Sidepanel</h2>
        <p>Click on the hamburger menu/bar icon to open the sidepanel.</p>
      </div>
    </div>
  );
};

export default Channel;
