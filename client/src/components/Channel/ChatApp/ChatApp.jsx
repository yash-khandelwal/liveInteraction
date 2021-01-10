import React, { useState } from "react";
import ChatAll from "./ChatAll/ChatAll.jsx";
import ChatPrivate from "./ChatPrivate/ChatPrivate.jsx";

const ChatApp = ({
  users,
  messages,
  message,
  setMessage,
  sendMessageToChannel,
  sendMessageToUser,
  privateMessages,
  userData,
  setPrivateMessages,
}) => {
  const [convType, setConvType] = useState("Channel");
  return (
    <div>
      <h1>ChatApp</h1>
      <div>
        <button
          onClick={() => {
            setConvType("Channel");
          }}
        >
          channel
        </button>
        <button
          onClick={() => {
            setConvType("Private");
          }}
        >
          private
        </button>
      </div>
      <div>
        {convType === "Channel" && (
          <ChatAll
            messages={messages}
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessageToChannel}
          />
        )}
        {convType === "Private" && (
          <ChatPrivate
            users={users}
            sendMessage={sendMessageToUser}
            privateMessages={privateMessages}
            userData={userData}
            setPrivateMessages={setPrivateMessages}
          />
        )}
      </div>
    </div>
  );
};

export default ChatApp;
