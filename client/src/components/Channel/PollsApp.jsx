import React, { useEffect } from "react";

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
}) => {
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
  // const sendTestMessage = () => {
  //   socket.emit("test", "message from polls app!");
  // };

  // const messagesEndReference = useRef(null);
  // const scrollToBottom = () => {
  //   messagesEndReference.current.scrollIntoView({ behavior: "smooth" });
  // };
  // useEffect(() => {
  //   scrollToBottom();
  // }, [polls]);

  return (
    <div className="poll-display">
      {[...polls.keys()].map((_id) => {
        return (
          <div className="chat-container px-2 mb-2" key={_id}>
            <div className="justify-content-between py-2 mt-2">
              <span>{polls.get(_id).question} ?</span>
            </div>
            <br />
            <div className="pl-3">
              {polls.get(_id).options.map((option, index) => {
                if (polls.get(_id).voted === index) {
                  return (
                    <div key={option._id}>
                      <p
                        style={{
                          border: "1px solid black",
                          borderRadius: "5px",
                          paddingLeft: "10px",
                          padding: "10px",
                          cursor: "pointer",
                          color: "black",
                          backgroundColor: "#818181",
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
                    <div key={option._id}>
                      <p
                        style={{
                          border: "1px solid #818181",
                          borderRadius: "5px",
                          paddingLeft: "10px",
                          padding: "10px",
                          cursor: "pointer",
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
      {role && (
        <div>
          <div
          >
            {createPoll && (
              <div
                style={{
                  position: "absolute",
                  right:0,
                  bottom:"7rem",
                  width: "90%",
                  backgroundColor: "#000",
                  margin: "5%",
                  padding: "10px",
                  border: "1px solid #fff",
                  height: "60%",
                  borderRadius: "5px",
                  overflow:"scroll",
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
                    width: '100%',
                  }}
                  onChange={(e) => {
                    setPollQuestion(e.target.value);
                  }}
                  autoFocus
                ></textarea>
                <hr />
                {optionList.map((option, index) => {
                  return (
                    <div key={index}>
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
                          borderRadius: "5px"
                        }}
                      >
                        remove
                      </button>
                      <hr />
                    </div>
                  );
                })}
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    addOption();
                  }}
                  style={{
                    fontWeight: "normal",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    marginLeft: "10px",
                    borderRadius: "5px"
                  }}
                >
                  new option
                </button>
                <hr />
                <button
                  onClick={() => {
                    if(pollQuestion && optionList.length > 1){
                      publishPoll({ pollQuestion, optionList });
                      setPollQuestion("");
                      setOptionList([]);
                      setCreatePoll(false);
                    } else {
                      // TODO: should be a toast
                    }
                  }}
                  style={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    marginLeft: "auto",
                    borderRadius: "5px",
                    width: "100%",
                    alignSelf: "center",
                  }}
                >
                  PUBLISH
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setCreatePoll((prev) => !prev);
              }}
              style={{
                position: "absolute",
                right:0,
                bottom:0,
                margin: "2rem",
                height: '4rem',
                width: '4rem',
                borderRadius: '2rem'
              }}
            >
              <h1>{createPoll?'←':'+'}</h1>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollsApp;
