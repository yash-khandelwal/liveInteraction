import React, { useState, useEffect, useRef } from "react";

const QnAApp = ({
  role,
  question,
  sendQuestionToChannel,
  sendAnswer,
  unlikeQuestion,
  likeQuestion,
  userId,
}) => {
  const [formData, setformData] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayAnswer, setDispalyAnswer] = useState(null);

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
  }, [question]);

  return (
    <div>
      {/* <ul
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
      </ul> */}
      {/* <div className="tab-content" id="pills-tabContent"> */}
      <div
        className="tab-pane fade show active px-2"
        id="pills-answered"
        role="tabpanel"
        aria-labelledby="pills-answered-tab"
      >
        <i
          className="fas fa-angle-up pb-2 justify-content-lg-end"
          style={{ width: "1.5rem", fontSize: "1.5rem", marginLeft: "25.5rem" }}
          onClick={(e) => scrollToTop()}
        />

        <div className=" qna-display ">
          <div ref={messagesStartReference} />
          {[...question.keys()].map((key, index) => {
            let ques = question.get(key);
            return (
              <div key={key}>
                <div className="chat-container px-2 mb-2">
                  <div className="justify-content-between pt-2 mt-2">
                    <span>{ques.questionText} ?</span>
                    <p className="text-muted pl-1">
                      By {ques.publishedByUserId} at 2:00PM
                    </p>
                  </div>
                  <div className="justify-content-between py-2">
                    <span
                      onClick={() => {
                        setDispalyAnswer((prev) => (prev === key ? null : key));
                      }}
                      style={{
                        cursor:
                          ques.answers.length > 0 ? "pointer" : "not-allowed",
                        // cursor: 'not-allowed'
                      }}
                    >
                      {ques.answers.length > 0
                        ? ques.answers.length + " Answers"
                        : "No Answeres yet"}
                    </span>
                    <span
                      style={{ float: "right", cursor: "pointer" }}
                      onClick={
                        ques.answers.length > 0
                          ? (e) => {
                              ques.likes.find(
                                (like) => like.likedBy === userId
                              ) !== -1
                                ? likeQuestion(key)
                                : unlikeQuestion(key);
                            }
                          : null
                      }
                    >
                      <em
                        className="fas fa-thumbs-up"
                        style={{ fontSize: "small", width: "1rem" }}
                      />
                      25
                    </span>
                    {displayAnswer === key &&
                      ques.answers.length > 0 &&
                      ques.answers.map((ans, index) => {
                        return (
                          <div key={index}>
                            <p>
                              {ans.answer.answeredBy}: {ans.answer.answerText}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                  <br />
                  {role && (
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
                        value={answer}
                      />
                    </form>
                  )}
                </div>
                <hr />
              </div>
            );
          })}
          <div ref={messagesEndReference} />
        </div>

        <i
          className="fas fa-angle-down pb-2 justify-content-lg-end"
          style={{
            width: "1.5rem",
            fontSize: "1.5rem",
            marginLeft: "25.5rem",
            cursor: "pointer",
          }}
          onClick={(e) => {
            scrollToBottom();
          }}
        />

        <div className="chatform">
          <form
            className="row"
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
              className="form-control col-sm-9 ml-2"
              aria-label="Sizing example input"
              aria-describedby="inputGroup-sizing-sm"
              placeholder="Type the Question here ..."
              style={{
                backgroundColor: "transparent",
                color: "white",
              }}
              onChange={(e) => {
                setformData(e.target.value);
              }}
              value={formData}
            />
            <button
              type="submit"
              className="btn text-white "
              onClick={(event) => {
                event.preventDefault();
                if (formData) {
                  sendQuestionToChannel(formData);
                  setformData("");
                }
              }}
            >
              <i
                className="fa fa-paper-plane"
                aria-hidden="true"
                style={{
                  fontSize: "1.2rem",
                  width: " 1.2rem ",
                  color: "white",
                }}
              ></i>
            </button>
          </form>
        </div>
      </div>
      {/* <div
          className="tab-pane fade"
          id="not-asnwered"
          role="tabpanel"
          aria-labelledby="not-asnwered-tab"
        >
          Hello123
        </div> */}
      {/* </div> */}
    </div>
  );
};

export default QnAApp;
