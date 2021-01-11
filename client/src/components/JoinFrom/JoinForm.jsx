import React, { useState } from "react";
import { Link } from "react-router-dom";

import "./JoinForm.css";

const JoinForm = () => {
  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [channel, setChannel] = useState("");
  return (
    <div>
      <h1>Join Credentials</h1>
      <input
        type="text"
        name="userName"
        id="userName"
        onChange={(e) => {
          setUserName(e.target.value);
        }}
        placeholder="username"
      />
      <input
        type="text"
        name="displayName"
        id="displayName"
        onChange={(e) => {
          setDisplayName(e.target.value);
        }}
        placeholder="display name"
      />
      <input
        type="text"
        name="channel"
        id="channel"
        onChange={(e) => {
          setChannel(e.target.value);
        }}
        placeholder="channel"
      />
      {/* <input type="radio" id="presenter" name="role" value="presenter"/>
            <label for="presenter">presenter</label>
            <input type="radio" id="audience" name="role" value="audience"/>
            <label for="audience">audience</label> */}
      <Link
        onClick={(e) => {
          if (!userName || !displayName || !channel) {
            e.preventDefault();
          }
        }}
        to={
          "/channel?username=" +
          userName +
          "&displayname=" +
          displayName +
          "&channel=" +
          channel
        }
      >
        <button type="submit">Join Channel</button>
      </Link>
    </div>
  );
};

export default JoinForm;
