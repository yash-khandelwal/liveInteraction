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
  pollIds,
  sendVote,
  sendVoteUpdate,
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

  return (
    <div>
      {pollIds.map((_id) => {
        return (
          <div className="chat-container px-2 mb-2" key={_id}>
            <div className="justify-content-between py-2 mt-2">
              <span>{polls.get(_id).question} ?</span>
            </div>
            <br />
            <div className="pl-3">
              {polls.get(_id).options.map((option, index) => {
                if(polls.get(_id).voted === index){
                return (
                  <div 
                      key={option._id}
                      >
                      <p
                        style={{
                          border: "1px solid black",
                          borderRadius: "5px",
                          paddingLeft: "10px",
                          padding: "10px",
                          cursor: "pointer",
                          color:"black",
                          backgroundColor: "#818181",
                        }}
                        onClick={() => {
                          if (polls.get(_id).voted !== index) sendVote(_id, option._id, index);
                          // else sendVoteUpdate({
                          //   pollId: _id, 
                          //   prevOptionId: polls.get(_id).options[polls.get(_id).voted]._id, 
                          //   prevOptionNum: polls.get(_id).voted, 
                          //   newOptionId: option._id, 
                          //   newOptionNum: index
                          //   });
                        }}
                      ><span style={{
                        borderRight: "1px solid black",
                        paddingLeft: "5px",
                        paddingRight: "5px",
                        marginRight: "10px",
                      }}>{index+1} </span>{option.text}
                        <span className="mr-4 votenumber"> 240 votes</span>
                      </p>
                    </div>
                );
                } else {
                  return (
                  <div 
                      key={option._id}
                      >
                      <p
                        style={{
                          border: "1px solid #818181",
                          borderRadius: "5px",
                          paddingLeft: "10px",
                          padding: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                        if (polls.get(_id).voted !== index) sendVote(_id, option._id, index);
                        // else sendVoteUpdate({
                        //   pollId: _id, 
                        //   prevOptionId: polls.get(_id).options[polls.get(_id).voted]._id, 
                        //   prevOptionNum: polls.get(_id).voted, 
                        //   newOptionId: option._id, 
                        //   newOptionNum: index
                        //   });
                      }}
                      ><span style={{
                        borderRight: "1px solid #818181",
                        paddingLeft: "5px",
                        paddingRight: "5px",
                        marginRight: "10px",
                      }}>{index+1} </span>{option.text}
                        <span className="mr-4 votenumber"> 240 votes</span>
                      </p>
                    </div>
                );
                }
              })}
            </div>
            <br />
            <div className="justify-content-center">
              <p className="text-center">Show result</p>
            </div>
          </div>
        );
      })}
      {role && (
        <div>
          <button
            onClick={() => {
              setCreatePoll((prev) => !prev);
            }}
          >
            create new poll
          </button>
          <div>
            {createPoll && (
              <div>
                <textarea
                  value={pollQuestion}
                  onChange={(e) => {
                    setPollQuestion(e.target.value);
                  }}
                  autoFocus
                ></textarea>
                <hr />
                {optionList.map((option, index) => {
                  return (
                    <div key={index}>
                      <input
                        type="text"
                        name="option"
                        value={option}
                        onChange={(event) => {
                          handleChange(event, index);
                        }}
                        autoFocus
                      />
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          removeOption(index);
                        }}
                      >
                        remove option
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
                >
                  add option
                </button>
                <hr />
                <button
                  onClick={() => {
                    publishPoll({ pollQuestion, optionList });
                    setPollQuestion("");
                    setOptionList([]);
                    setCreatePoll(false);
                  }}
                >
                  publish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PollsApp;
