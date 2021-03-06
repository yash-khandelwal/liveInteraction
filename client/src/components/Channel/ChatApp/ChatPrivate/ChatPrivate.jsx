import React, { useState } from "react";

const ChatPrivate = ({
  users,
  sendMessage,
  privateMessages,
  userData,
  setPrivateMessages,
}) => {
  const [message, setMessage] = useState("");
  const [chating, setChating] = useState(null);
  return (
    <div className="private-chat">
      <hr />
      {users.map((user, index) => {
        if (user.userName !== userData.userName)
          return (
            <div key={index}>
              <h3
                onClick={() => {
                  setChating((prev) =>
                    prev === user.userName ? null : user.userName
                  );
                  setPrivateMessages((prevPrivateMessages) => {
                    prevPrivateMessages.set(user.userName, {
                      ...privateMessages.get(user.userName),
                      unread: 0,
                    });
                    console.log(prevPrivateMessages);
                    return new Map(prevPrivateMessages);
                  });
                  setMessage("");
                }}
                style={{
                  cursor: "pointer",
                }}
              >
                {user.displayName}{" "}
                {privateMessages.get(user.userName).unread > 0 && (
                  <span>[{privateMessages.get(user.userName).unread}]</span>
                )}
              </h3>
              {chating === user.userName && (
                <div>
                  {privateMessages.get(user.userName).messages &&
                    privateMessages
                      .get(user.userName)
                      .messages.map((message, index) => {
                        return (
                          <p key={index}>
                            <span className="username">{message.user}</span>{" "}
                            {message.text}
                          </p>
                        );
                      })}
                  <form>
                    <input
                      type="text"
                      name="message"
                      id="message"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                      }}
                      autoFocus
                    />
                    <button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        sendMessage({
                          toSocket: user.id,
                          to: user.userName,
                          message: message,
                        });
                        setMessage("");
                      }}
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}
              <hr />
            </div>
          );
        else {
          return "";
        }
      })}
    </div>
  );
};

export default ChatPrivate;
