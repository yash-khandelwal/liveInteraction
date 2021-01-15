import React, { useState, useEffect, useRef } from "react";

const ChatPrivate = ({
  users,
  sendMessage,
  privateMessages,
  userData,
  setPrivateMessages,
}) => {
  const [message, setMessage] = useState("");
  const [chating, setChating] = useState(null);

  const messagesEndReference = useRef(null);
  const scrollToBottom = () => {
    messagesEndReference.current.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    if (chating) {
      scrollToBottom();
    }
  }, [privateMessages]);

  return (
    <div className="private-chat">
      {chating ? (
        <div className="channel-chat">
          {/* <p>ChatAll</p> */}

          <div className="chat-container px-2 mb-2">
            <div className="justify-content-center">
              <h5 className="text-center">
                <i
                  className="far fa-times-circle"
                  style={{ width: "1rem", fontSize: "1rem", cursor: "pointer" }}
                  onClick={(e) => {
                    setChating(null);
                  }}
                />
                {chating.userName}
              </h5>
              <p className="text-center text-muted">
                A web Developer and Devops Engineer
              </p>
            </div>
          </div>

          <div className=" private-chat-display ">
            {privateMessages.get(chating.userName).messages &&
              privateMessages
                .get(chating.userName)
                .messages.map((msg, index) => {
                  return (
                    <div className="public-chat px-2 mb-2  " key={index}>
                      <div className="justify-content-between py-2">
                        <span>{msg.user}</span>
                        <span style={{ float: "right" }}>11:00</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  );
                })}
            <div ref={messagesEndReference} />
          </div>
          <div className="chatform">
            <form className="row">
              <input
                type="text "
                className="form-control col-sm-10 ml-4"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-sm"
                placeholder="Type the answer here ..."
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                }}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              />
              <button
                type="submit"
                className="btn text-white "
                onClick={(e) => {
                  e.preventDefault();
                  sendMessage({
                    toSocket: chating.id,
                    to: chating.userName,
                    message: message,
                  });
                  setMessage("");
                }}
              >
                <i
                  className="fa fa-paper-plane"
                  aria-hidden="true"
                  style={{
                    fontSize: "1.5rem",
                    width: " 1.5rem ",
                    color: "white",
                  }}
                ></i>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div
          className="list-wrapper"
          ng-app="app"
          ng-controller="MainCtrl as ctrl"
        >
          <ul className="list">
            {users.map((user, index) => {
              if (user.userName !== userData.userName) {
                return (
                  <li
                    className="list-item "
                    key={index}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setChating(user);
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
                  >
                    <div>
                      <img
                        alt="alt text"
                        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/488320/profile/profile-80.jpg"
                        className="list-item-image"
                      />
                    </div>
                    <div className="list-item-content">
                      <h4>
                        {user.displayName}{" "}
                        {privateMessages.get(user.userName).unread > 0 && (
                          <span>
                            [{privateMessages.get(user.userName).unread}]
                          </span>
                        )}
                      </h4>
                      <p>@hk-skit</p>
                    </div>
                  </li>
                );
              }
              return "";
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatPrivate;
