import React, { useState } from "react";

const QnAApp = ({ role, question, sendQuestionToChannel, sendAnswer }) => {
  const [formData, setformData] = useState("");
  const [answer, setAnswer] = useState("");

  return (
    <div>
      <ul
        className="nav nav-pills mb-3 justify-content-center"
        id="pills-tab text-center"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <a
            className="nav-link active text-center"
            id="pills-public-tab"
            data-toggle="pill"
            href="#pills-answered"
            role="tab"
            aria-controls="pills-answered"
            aria-selected="true"
            style={{ width: "13rem" }}
          >
            Answered
          </a>
        </li>
        <li className="nav-item" role="presentation">
          <a
            className="nav-link text-center"
            id="pills-private-tab"
            data-toggle="pill"
            href="#not-asnwered"
            role="tab"
            aria-controls="not-asnwered"
            aria-selected="false"
            style={{ width: "13rem" }}
          >
            Unanswered
          </a>
        </li>
      </ul>
      <div className="tab-content" id="pills-tabContent">
        <div
          className="tab-pane fade show active px-2"
          id="pills-answered"
          role="tabpanel"
          aria-labelledby="pills-answered-tab"
        >
          <div className=" chat-display ">
            {[...question.keys()].map((key, index) => {
              let ques = question.get(key);
              return (
                <div key={key}>
                  <div className="chat-container px-2 mb-2">
                    <div className="justify-content-between pt-2 mt-2">
                      <span>{ques.question} ?</span>
                      <p className="text-muted pl-1">
                        By {ques.from} at 2:00PM
                      </p>
                    </div>
                    <div className="justify-content-between py-2">
                      <span>{ques.answer.length} Answers</span>
                      <span style={{ float: "right" }}>
                        <em
                          className="fas fa-thumbs-up"
                          style={{ fontSize: "small", width: "1rem" }}
                        />
                        25
                      </span>
                      {ques.answer.length > 0 ? (
                        ques.answer.map((ans) => {
                          return (
                            <div>
                              <p>
                                {ans.from}: {ans.answer}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p>No Answeres yet</p>
                      )}
                    </div>
                    <br />
                    <form
                      className="input-group mb-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (answer) {
                          sendAnswer(key, answer);
                          setAnswer("");
                        }
                      }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        aria-label="Sizing example input"
                        placeholder="Type the answer here ..."
                        aria-describedby="inputGroup-sizing-sm"
                        style={{
                          backgroundColor: "transparent",
                          color: "white",
                        }}
                        onChange={(e) => {
                          setAnswer(e.target.value);
                        }}
                      />
                    </form>
                  </div>
                  <hr />
                </div>
              );
            })}
          </div>

          <div className="chatform">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (formData) {
                  sendQuestionToChannel(formData);
                  setformData("");
                }
              }}
            >
              <input
                type="text"
                className="form-control"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-sm"
                placeholder="Type the answer here ..."
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                }}
                onChange={(e) => {
                  setformData(e.target.value);
                }}
                value={formData}
              />
            </form>
          </div>
        </div>
        <div
          className="tab-pane fade"
          id="not-asnwered"
          role="tabpanel"
          aria-labelledby="not-asnwered-tab"
        >
          Hello123
        </div>
      </div>
    </div>
  );
};

export default QnAApp;
