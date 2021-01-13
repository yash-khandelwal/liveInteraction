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
  const sendTestMessage = () => {
    socket.emit("test", "message from polls app!");
  };

  return (
    <div>
      {pollIds.map((id) => {
        return (
          <div className="chat-container px-2 mb-2" key={id}>
            <div className="justify-content-between py-2 mt-2">
              <span>{polls.get(id).question} ?</span>
            </div>
            <br />
            <div className="pl-3">
              {polls.get(id).options.map((option, index) => {
                return (
                  <div className="form-check py-2" key={index}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="exampleRadios"
                      id="exampleRadios1"
                      defaultChecked={polls.get(id).voted === index}
                      onChange={() => {
                        if (!polls.get(id).voted) sendVote(id, index);
                        else sendVoteUpdate(id, polls.get(id).voted, index);
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="exampleRadios1"
                    >
                      {option.option}
                      <span className="mr-4 votenumber"> 240 votes</span>
                    </label>
                  </div>
                );
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
