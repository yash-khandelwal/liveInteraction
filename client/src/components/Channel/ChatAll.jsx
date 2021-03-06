import React, { useEffect, useRef } from "react";

const ChatAll = ({ messages, message, setMessage, sendMessage }) => {
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const messagesStartReference = useRef(null);
  const scrollToTop = () => {
    messagesStartReference.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="channel-chat">
      {/* <p>ChatAll</p> */}

      <i
        className="fas fa-angle-up pb-2 justify-content-lg-end"
        style={{ width: "1.5rem", fontSize: "1.5rem", marginLeft: "26.2rem" }}
        onClick={(e) => scrollToTop()}
      />
      <div className=" chat-display ">
        <div ref={messagesStartReference} />

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
        <div ref={messagesEndRef} />
      </div>
      <i
        className="fas fa-angle-down pb-2 justify-content-lg-end"
        style={{
          width: "1.5rem",
          fontSize: "1.5rem",
          marginLeft: "26.2rem",
          cursor: "pointer",
        }}
        onClick={(e) => {
          scrollToBottom();
        }}
      />
      <div className="chatform">
        <form className="row"
          style={{
                backgroundColor: "#fff4",
                borderRadius: '1rem',
                width: '90%',
                marginLeft: '3%',
                paddingRight: '-5%',
              }}
        >
          <input
            type="text"
            className="form-control col-sm-9 ml-3"
            aria-label="Sizing example input"
            aria-describedby="inputGroup-sizing-sm"
            placeholder="Type the answer here ..."
                style={{
                  backgroundColor: 'transparent',
                  color: "white",
                  borderRadius: '1rem',
                  border: '0px',
                }}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            value={message}
          />
          <button
            type="submit"
            className="btn text-white "
            onClick={(event) => {
              event.preventDefault();
              if (message) {
                sendMessage();
              }
            }}
          >
            <i
              className="fa fa-paper-plane"
              aria-hidden="true"
              style={{
                fontSize: "1.2rem",
                width: " 1.5rem ",
                color: "white",
              }}
            ></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAll;
