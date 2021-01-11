import React from "react";

const ChatAll = ({ messages, message, setMessage, sendMessage }) => {
  return (
    <div className="channel-chat">
      {/* <p>ChatAll</p> */}

      <div className=" chat-display ">
        {messages.map((msg, index) => {
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
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            value={message}
          />
          <button
            type="submit"
            onClick={(event) => {
              event.preventDefault();
              if (message) {
                sendMessage();
              }
            }}
          ></button>
        </form>
      </div>
    </div>
  );
};

export default ChatAll;
