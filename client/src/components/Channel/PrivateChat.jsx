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


{
    chating ? 

    (
      <div className="channel-chat">
      {/* <p>ChatAll</p> */}

      <div className=" chat-display ">
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
      </div>
      <div className="chatform">
        <form action>
          <input
            type="text"
            className="form-control "
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
            onClick={(e) => {
              e.preventDefault();
              sendMessage({
                toSocket: chating.id,
                to: chating.userName,
                message: message,
              });
              setMessage("");
            }}
        ></button>
        </form>
      </div>
    </div>
  

    )
    :
    (

      <div className="list-wrapper" ng-app="app" ng-controller="MainCtrl as ctrl">
      <ul className="list">
        {users.map((user, index) => {
                if (user.userName !== userData.userName)
                {
                    return (
                        <li className="list-item " key={index}                  
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
                            <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/488320/profile/profile-80.jpg" className="list-item-image" />
                            </div>
                            <div className="list-item-content">
                            <h4>{user.displayName}{" "}
                                    {privateMessages.get(user.userName).unread > 0 && (
                                    <span>[{privateMessages.get(user.userName).unread}]</span>
                                    )}</h4>
                            <p>@hk-skit</p>
                            </div>
                            </li>
                    );
                }
                else {
                return "";
                }
            })}
            </ul>
          </div>
    
    
        ) 
}


    </div>


  );
};

export default ChatPrivate;
