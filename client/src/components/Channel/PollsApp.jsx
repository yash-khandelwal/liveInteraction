import React, { useEffect, useRef } from "react";

const PollsApp = ({
  socket,
  role,
  publishPoll,
  polls,
  createPoll,
  setCreatePoll,
  pollQuestion,
  setPollQuestion,
  optionList,
  setOptionList,
  sendVote,
  newPoll
}) => {
  const messagesEndReference = useRef(null);
  const scrollToBottom = () => {
    messagesEndReference.current.scrollIntoView({ behavior: "smooth" });
  };

  const messagesStartReference = useRef(null);
  const scrollToTop = () => {
    messagesStartReference.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [newPoll]);

  const handleChange = (event, index) => {
    console.log("handle change triggered!");
    let newList = [...optionList];
    newList[index] = event.target.value;
    setOptionList(newList);
  };
  const addOption = () => {
    setOptionList((prevList) => [...prevList, ""]);
    console.log(optionList);
  };
  const removeOption = (index) => {
    setOptionList((prevList) =>
      prevList.filter((option, i) => {
        return i !== index;
      })
    );
  };
  useEffect(() => {
    if (socket) {
      socket.on("testAck", (res) => {
        console.log("got Response ", res);
      });
    }
  }, [socket]);
  return (
    <div>
      <i
        className="fas fa-angle-up pb-2 justify-content-lg-end"
        style={{ width: "1.5rem", fontSize: "1.5rem", marginLeft: "26.2rem" }}
        onClick={(e) => scrollToTop()}
      />
      <div className="poll-display">
        <div ref={messagesStartReference} />

        {[...polls.keys()].map((_id) => {
          return (
            <div
              className="chat-container px-2 mb-2"
              key={_id}
              style={{
                zIndex: 1,
              }}
            >
              <div className="justify-content-between py-2 mt-2">
                <span>{polls.get(_id).question} ?</span>
              </div>
              <br />
              <div className="pl-3">
                {polls.get(_id).options.map((option, index) => {
                  if (polls.get(_id).voted === index) {
                    return (
                      <div
                        key={option._id}
                        style={{
                          padding: "0 10px",
                        }}
                      >
                        <p
                          style={{
                            border: "1px solid black",
                            borderRadius: "5px",
                            padding: "0 10px",
                            cursor: "pointer",
                            color: "black",
                            backgroundColor: "#eee",
                            backdropFilter: "blur(40px)",
                            backgroundClip: "padding-box",
                            boxShadow: "1px 1px 1px #fff6",
                            zIndex: 1,
                          }}
                          onClick={() => {
                            if (polls.get(_id).voted !== index)
                              sendVote(_id, option._id, index);
                          }}
                        >
                          <span
                            style={{
                              borderRight: "1px solid black",
                              paddingLeft: "5px",
                              paddingRight: "5px",
                              marginRight: "10px",
                            }}
                          >
                            {index + 1}{" "}
                          </span>
                          {option.text}
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={option._id}
                        style={{
                          padding: "0 10px",
                        }}
                      >
                        <p
                          style={{
                            border: "1px solid #818181",
                            borderRadius: "5px",
                            padding: "0 10px",
                            cursor: "pointer",
                            // backdropFilter: "blur(40px)",
                            backgroundClip: "padding-box",
                            boxShadow: "1px 1px 1px #fff6",
                            zIndex: 1,
                          }}
                          onClick={() => {
                            if (polls.get(_id).voted !== index)
                              sendVote(_id, option._id, index);
                          }}
                        >
                          <span
                            style={{
                              borderRight: "1px solid #818181",
                              paddingLeft: "5px",
                              paddingRight: "5px",
                              marginRight: "10px",
                            }}
                          >
                            {index + 1}{" "}
                          </span>
                          {option.text}
                        </p>
                      </div>
                    );
                  }
                })}
              </div>
              <br />
            </div>
          );
        })}
        <div ref={messagesEndReference} />

        {role && (
          <div>
            <div>
              {createPoll && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: "7rem",
                    width: "90%",
                    backgroundColor: "#0009",
                    backdropFilter: "blur(40px)",
                    backgroundClip: "padding-box",
                    boxShadow: "2px 2px 2px #fff6",
                    zIndex: 1,
                    margin: "5%",
                    // padding: "10px",
                    border: "2px solid #fff9",
                    height: "60%",
                    borderRadius: "10px",
                    overflow: "scroll",
                  }}
                >
                  <textarea
                    value={pollQuestion}
                    aria-label="Sizing example input"
                    placeholder="Type the Poll Question ..."
                    aria-describedby="inputGroup-sizing-sm"
                    style={{
                      backgroundColor: "transparent",
                      color: "white",
                      width: "90%",
                      borderRadius: "10px",
                      margin: "5% 5%",
                    }}
                    onChange={(e) => {
                      setPollQuestion(e.target.value);
                    }}
                    autoFocus
                  ></textarea>
                  <hr />
                  {optionList.map((option, index) => {
                    return (
                      <div
                        key={index}
                        style={{
                          margin: "-5% 5%",
                        }}
                      >
                        <span
                          style={{
                            borderRight: "1px solid black",
                            paddingLeft: "5px",
                            paddingRight: "5px",
                            marginRight: "10px",
                          }}
                        >
                          {index + 1}{" "}
                        </span>
                        <input
                          type="text"
                          name="option"
                          aria-label="Sizing example input"
                          placeholder="option..."
                          aria-describedby="inputGroup-sizing-sm"
                          style={{
                            backgroundColor: "transparent",
                            color: "white",
                            width: "60%",
                            borderRadius: "5px",
                          }}
                          value={option}
                          onChange={(event) => {
                            handleChange(event, index);
                          }}
                          autoFocus
                          autoComplete="off"
                        />
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            removeOption(index);
                          }}
                          style={{
                            fontWeight: "normal",
                            paddingLeft: "10px",
                            paddingRight: "10px",
                            marginLeft: "10px",
                            borderRadius: "5px",
                          }}
                        >
                          remove
                        </button>
                        <hr />
                      </div>
                    );
                  })}
                  {/* <button
            onClick={(event) => {
              event.preventDefault();
              addOption();
            }}
            style={{
              fontWeight: "normal",
              paddingLeft: "10px",
              paddingRight: "10px",
              marginLeft: "12%",
              borderRadius: "5px",
            }}
          >
            new option
          </button> */}
                  <hr />
                  <div
                    style={{
                      width: "100%",
                      position: "sticky",
                      bottom: "0",
                      background: "#000",
                      paddingLeft: "10%",
                    }}
                  >
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        addOption();
                      }}
                      style={{
                        fontWeight: "normal",
                        fontSize: "1.1rem",
                        paddingLeft: "10px",
                        paddingRight: "10px",
                        marginLeft: "2%",
                        borderRadius: "5px",
                        width: "40%",
                      }}
                    >
                      new option
                    </button>
                    <button
                      onClick={() => {
                        if (pollQuestion && optionList.length > 1) {
                          publishPoll({ pollQuestion, optionList });
                          setPollQuestion("");
                          setOptionList([]);
                          setCreatePoll(false);
                          scrollToBottom();
                        } else {
                          // TODO: should be a toast
                        }
                      }}
                      style={{
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        paddingLeft: "10px",
                        paddingRight: "10px",
                        margin: "0 2%",
                        borderRadius: "5px",
                        alignSelf: "center",
                        width: "42%",
                      }}
                    >
                      PUBLISH
                      <i
                        className="fa fa-paper-plane"
                        aria-hidden="true"
                        style={{
                          fontSize: "1.5rem",
                          width: " 1.5rem ",
                          color: "black",
                          marginLeft: "5px",
                        }}
                      ></i>
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setCreatePoll((prev) => !prev);
                }}
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  margin: "2rem",
                  height: "4rem",
                  width: "4rem",
                  borderRadius: "2rem",
                }}
              >
                <h1>{createPoll ? "←" : "+"}</h1>
              </button>
            </div>
          </div>
        )}
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
    </div>
  );
};

export default PollsApp;
